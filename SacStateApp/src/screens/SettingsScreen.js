// screens/SettingScreen.js
import React, {useState, useEffect} from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Button, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/SettingsStyles'; // Import styles
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { fetchUserAreaOfStudy } from '../DashboardAPI/api';
import { fetchUserYearOfStudy } from '../DashboardAPI/api';
import ProfileModals from '../SettingsScreenComponents/ProfileModals'; //when a user clicks on a profile/setting screen button, it'll render this

const SettingsScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [userAreaOfStudy, setUserAreaOfStudy] = useState(null);
  const [userYearOfStudy, setUserYearOfStudy] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [newPreferredName, setNewPreferredName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [oldPassword, setOldPassword] = useState('');


  useEffect(() => {
    displayUserPreferredName();
    displayUserAreaOfStudy();
    displayUserYearOfStudy();
  }, []);

  //lets the user log out
  const logout = async (navigation, type) => {
    try {
      await AsyncStorage.removeItem('authToken'); //remove token
      navigation.reset({
        index: 0,
        routes: [{ name: 'LogIn' }],
      });
      if (type == 'passwordChanged'){
        Alert.alert("Password Updated", "Please sign in with your new password");
      } else if(type == 'logout'){
        Alert.alert("Logout", "Successfully logged out");
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Displays the User's name by JWT authentication
  const displayUserPreferredName = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      // console.log("Attempting to display name");
      const response = await axios.get(`http://${process.env.DEV_BACKEND_SERVER_IP}:5000/api/students/getName`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log("name gotten")
      setUserInfo(response.data);
      console.log(userInfo);
    } catch (error) {
      console.error('Error displaying user name: ', error);
    }
  };
  const displayUserAreaOfStudy = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error("Token not found");
        return;
      }
      const areaOfStudy = await fetchUserAreaOfStudy(token);
      setUserAreaOfStudy(capitalizeWords(areaOfStudy[0].tag_name));
    } catch (err) {
      console.error("Couldn't get the user area of study", err);
    }
  };
  const displayUserYearOfStudy = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error("Token not found");
        return;
      }
      const yearOfStudy = await fetchUserYearOfStudy(token);
      setUserYearOfStudy(capitalizeWords(yearOfStudy[0].tag_name));
    } catch (err) {
      console.error("Couldn't get the user year of study", err);
    }
  };

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  };

  const openModal = (content) => {
    setModalContent(content);
    setModalVisible(true);
  }

  const updateNameFunction = async () => {
    //remove spaces from name
    let trimmedName = newPreferredName.trim();
    //check if name is empty
    if(!trimmedName) {
      Alert.alert("Error", "Name cannot be empty.");
      return;
    }
    //check if name contains letters only
    if (!/^[A-Za-z]+$/.test(trimmedName)) {
      Alert.alert("Error", "Name can only contain letters.");
      return;
    }
    //check if name isn't same as the current name
    if(trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1).toLowerCase() === userInfo.preferred_name){
      Alert.alert("Error", "Name cannot be the same.");
      return;
    }
    //check if length of name is too long
    if (trimmedName.length > 20) {
      Alert.alert("Error", "Name cannot be longer than 20 characters");
      return;
    }

    //capitalize first letter, lowercase rest
    let formattedName = trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1).toLowerCase();

    setNewPreferredName(formattedName);
    //call api to update the name
    try{
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(`http://${process.env.DEV_BACKEND_SERVER_IP}:5000/api/students/updatePreferredName`,
        { newPreferredName },
        { headers: { Authorization: `Bearer ${token}` },}
      );
      if (!response.data.success) {
        Alert.alert("Error", "Unable to update your preferred name.");
      } else {
        displayUserPreferredName();
        Alert.alert("Successs", `You have changed your name to ${newPreferredName}`);
        setModalVisible(false);
      }
    } catch (error) {
      Alert.alert("Error", "Unable to update your name");
    }
    setNewPreferredName('');
  };

  const updatePasswordFunction = async (oldPassword, newPass1, newPass2) => {
    //check if oldpass is == new pass
    if (oldPassword == newPass1 || oldPassword == newPass2){
      Alert.alert("Error", "New password cannot be the same as old password");
      return;
    }
    //checking if new passwords match
    if (newPass1 != newPass2){
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    //checking if password length is long enough
    if (newPass1.length < 6 || newPass1.length > 25){
      Alert.alert("Error", "Password must be between 10 and 25 characters long.");
      return;
    }

    //call api to change password
    // that checks if the password (hashed) isn't already in the database for that userid,
    // and if it returns true then password wasn't so it will update the password
    // api call will pass in the old password and new password to
    // compare old password to new password and make sure it's not the same
    try{
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(`http://${process.env.DEV_BACKEND_SERVER_IP}:5000/api/login_info/updatePassword`,
        {
          oldPassword,
          newPassword: newPass1, 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success == true){//api call returned true
        setModalVisible(false);
        setNewPassword('');
        setNewPassword2('');
        setOldPassword('');
        logout(navigation, 'passwordChanged');
      } else {//true
        Alert.alert("Error", "Couldn't update password");
        return;
      }
    } catch (error) {
      console.log("Error:", error.response ? error.response.data : error.message);
      Alert.alert("Error", "Couldn't update password");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileBox} >
        <Ionicons name="person-circle-outline" size={50} color={styles.iconColor.color} style={styles.profileIcon} />
        <View>
          <Text style={styles.profileName}>
          {
            userInfo
              ? userInfo.preferred_name
                ? userInfo.preferred_name
                : `${userInfo.first_name} ${userInfo.last_name}`
              : 'Loading Name'
          }
          </Text>
          <Text style={styles.profileEmail}>{userAreaOfStudy}</Text>
          <Text style={styles.profileEmail}>Grade: {userYearOfStudy}</Text>
        </View>
      </View>

      {/* General Settings */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>General</Text>
      </View>
      <View style={styles.sectionContainer}>
        
        <SettingsItem icon="pencil" text="Edit Preferred Name" onPress={() => openModal('editProfileName')} />
        {/* <SettingsItem icon="moon-outline" text="Theme (Light/Dark Mode)" onPress={() => openModal('editTheme')} /> */}
        {/* <SettingsItem icon="notifications-outline" text="Notification Settings" onPress={() => openModal('editNotifitcations')} /> */}
        <SettingsItem icon="log-out-outline" text="Logout" onPress={() => logout(navigation, 'logout')} />
        {/* <SettingsItem icon="add-circle" text="Increase Font Size" />
        <SettingsItem icon="remove-circle" text="Decrease Font Size" /> */}
      </View>

      {/* Security & Privacy */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Security & Privacy</Text>
      </View>
      <View style={styles.sectionContainer}>
        <SettingsItem icon="key-outline" text="Change Password" onPress={() => openModal('editPassword')} />
        <SettingsItem icon="cloud-download-outline" text="Download my chatbot history" onPress={() => openModal('downloadChatbotData')} />
        <SettingsItem icon="remove-circle-outline" text="Delete my chatbot history" onPress={() => openModal('deleteChatbotData')} />
        <SettingsItem icon="trash-outline" text="Deactivate Account" onPress={() => openModal('deactivateAccount')} />
      </View>

      {/* About & Legal */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>About & Legal</Text>
      </View>
      <View style={styles.sectionContainer}>
        {/* 
        <SettingsItem icon="shield-checkmark-outline" text="Privacy Policy" />
        <SettingsItem icon="information-circle-outline" text="App Version" /> */}
        <SettingsItem icon="information-circle-outline" text="Sac State LIFE App" onPress={() => openModal('about')} />
        <SettingsItem icon="document-text-outline" text="Terms of Service" onPress={() => openModal('tos')}/>
      </View>

      {/* Centered Modal with Blurred Background */}
      <ProfileModals modalVisible={modalVisible} modalContent={modalContent} newPassword={newPassword} 
        setNewPassword={setNewPassword} newPreferredName={newPreferredName} setNewPreferredName={setNewPreferredName} 
        updateNameFunction={updateNameFunction} updatePasswordFunction={updatePasswordFunction}
        setModalVisible={setModalVisible} newPassword2={newPassword2} setNewPassword2={setNewPassword2}
        oldPassword={oldPassword} setOldPassword={setOldPassword} setModalContent={setModalContent}
        navigation={navigation} logout={logout}
        />
    </ScrollView>
  );
};

const SettingsItem = ({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <Ionicons name={icon} size={22} color={styles.iconColor.color} />
    <Text style={styles.itemText}>{text}</Text>
  </TouchableOpacity>
);

export default SettingsScreen;