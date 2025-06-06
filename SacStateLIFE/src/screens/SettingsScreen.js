// screens/SettingScreen.js
import React, {useState, useEffect} from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Button, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/SettingsStyles'; // Import styles
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { fetchUserAreaOfStudy, fetchUserYearOfStudy } from '../DashboardAPI/api';
import ProfileModals from '../SettingsScreenComponents/ProfileModals'; // when a user clicks on a profile/setting screen button, it'll render this
import PushNotificationService from '../notifications/PushNotificationService';
import BASE_URL from '../apiConfig';
import * as filter from 'leo-profanity';
import messaging from '@react-native-firebase/messaging';

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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);


  useEffect(() => {
    displayUserPreferredName();
    displayUserAreaOfStudy();
    displayUserYearOfStudy();
    filter.loadDictionary();

    AsyncStorage.getItem('notificationsEnabled').then(val => {
      if (val !== null) setNotificationsEnabled(JSON.parse(val));
    });
  }, []);


  //lets the user log out
  const logout = async (navigation, type) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const fcmToken = await PushNotificationService.getToken(); // Just returns device token
  
      if (userId && fcmToken) {
        await axios.delete(`${BASE_URL}/api/notifications/remove-token`, {
          data: {
            userId: parseInt(userId),
            fcmToken,
          },
        });

        await messaging().deleteToken();
        console.log("Local FCM token deleted");
      }
  
      // Clear all keys that were set during login
      await AsyncStorage.removeItem('token'); 
      await AsyncStorage.removeItem('username');
      await AsyncStorage.removeItem('userId');
  
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
      const response = await axios.get(`${BASE_URL}/api/students/getName`, {
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
    // check if name contains inappropriate language
    if (filter.check(trimmedName)) {
      Alert.alert("Error", "Name contains inappropriate language.");
      return;
    }
    //capitalize first letter, lowercase rest
    let formattedName = trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1).toLowerCase();

    setNewPreferredName(formattedName);
    //call api to update the name
    try{
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(`${BASE_URL}/api/students/updatePreferredName`,
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
    //check if password has bad words
    if (filter.check(newPass1)) {
      Alert.alert("Error", "Password cannot contain inappropriate language.");
      return;
    }

    //checking if password length is long enough
    if (newPass1.length < 6 || newPass1.length > 25){
      Alert.alert("Error", "Password must be between 10 and 25 characters long.");
      return;
    }

     // check for uppercase letter
    if (!/[A-Z]/.test(newPass1)) {
      Alert.alert("Error", "Password must include at least one uppercase letter.");
      return;
    }

    // check for special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPass1)) {
      Alert.alert("Error", "Password must include at least one special character.");
      return;
    }


    //call api to change password
    // that checks if the password (hashed) isn't already in the database for that userid,
    // and if it returns true then password wasn't so it will update the password
    // api call will pass in the old password and new password to
    // compare old password to new password and make sure it's not the same
    try{
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(`${BASE_URL}/api/login_info/updatePassword`,
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

  const toggleNotifications = async () => {
    try {
      if (notificationsEnabled) {
        await messaging().deleteToken(); // This prevents further push notifications
        console.log("Notifications disabled");
      } else {
        await PushNotificationService.getToken(); // Re-register for notifications
        console.log("Notifications enabled");
      }

      Alert.alert("Notification Setting", notificationsEnabled ? "Notifications disabled." : "Notifications enabled.");
  
      setNotificationsEnabled(!notificationsEnabled);
      await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(!notificationsEnabled));
    } catch (error) {
      console.error('Error toggling notifications:', error);
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
        <SettingsItem icon={notificationsEnabled ? "notifications" : "notifications-off"}
          text={notificationsEnabled ? "Disable Notifications" : "Enable Notifications"}
          onPress={toggleNotifications}
        />
        <SettingsItem icon="log-out-outline" text="Logout" onPress={() => openModal('logoutConfirm')} />
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

      {/* Modals */}
      {modalContent === 'logoutConfirm' && modalVisible && (
        <Modal transparent={true} animationType="fade" visible={modalVisible}>
          <View style={styles.blurBackground}>
            <View style={styles.centeredModal}>
              <Text style={styles.modalTitle}>Are you sure you want to log out?</Text>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  logout(navigation, 'logout');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.saveButtonText}>Yes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}


      {/* Centered Modal for Other Settings */}
      {modalContent !== 'logoutConfirm' && (
        <ProfileModals
          modalVisible={modalVisible}
          modalContent={modalContent}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          newPreferredName={newPreferredName}
          setNewPreferredName={setNewPreferredName}
          updateNameFunction={updateNameFunction}
          updatePasswordFunction={updatePasswordFunction}
          setModalVisible={setModalVisible}
          newPassword2={newPassword2}
          setNewPassword2={setNewPassword2}
          oldPassword={oldPassword}
          setOldPassword={setOldPassword}
          setModalContent={setModalContent}
          navigation={navigation}
          logout={logout}
        />
      )}
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