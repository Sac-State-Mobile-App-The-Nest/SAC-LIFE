// screens/SettingScreen.js
import React, {useState, useEffect} from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../SettingsStyles/SettingsStyles'; // Import styles
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { fetchUserAreaOfStudy } from '../DashboardAPI/api';
import { fetchUserYearOfStudy } from '../DashboardAPI/api';

const SettingsScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [userAreaOfStudy, setUserAreaOfStudy] = useState(null);
  const [userYearOfStudy, setUserYearOfStudy] = useState(null);

  // Displays the User's name by JWT authentication
  const displayUserFirstLastName = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`http://${process.env.DEV_BACKEND_SERVER_IP}:5000/api/students/getName`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserInfo(response.data);
    } catch (error) {
      console.error('Error displaying user first and last name: ', error);
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

  useEffect(() => {
    displayUserFirstLastName();
    displayUserAreaOfStudy();
    displayUserYearOfStudy();
  }, []);

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <TouchableOpacity style={styles.profileBox} onPress={() => navigation.navigate('Profile')}>
        <Ionicons name="person-circle-outline" size={50} color={styles.iconColor.color} style={styles.profileIcon} />
        <View>
          <Text style={styles.profileName}>{userInfo ? `${userInfo.f_name} ${userInfo.m_name ? `${userInfo.m_name} ` : ''}${userInfo.l_name}` : 'Loading Name'}</Text>
          <Text style={styles.profileEmail}>{userAreaOfStudy}</Text>
          <Text style={styles.profileEmail}>Grade: {userYearOfStudy}</Text>
        </View>
      </TouchableOpacity>

      {/* General Settings */}
      <View style={styles.sectionContainer}>
        <SettingsItem icon="moon-outline" text="Theme (Light/Dark Mode)" />
        <SettingsItem icon="globe-outline" text="Language" />
        <SettingsItem icon="notifications-outline" text="Notification Settings" />
      </View>

      {/* Security & Privacy */}
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Security & Privacy</Text></View>
      <View style={styles.sectionContainer}>
        <SettingsItem icon="key-outline" text="Change Password" />
        <SettingsItem icon="lock-closed-outline" text="Two-Factor Authentication" />
        <SettingsItem icon="trash-outline" text="Delete Account" />
      </View>

      {/* Help & Support */}
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Help & Support</Text></View>
      <View style={styles.sectionContainer}>
        <SettingsItem icon="help-circle-outline" text="FAQs" />
        <SettingsItem icon="chatbubble-ellipses-outline" text="Contact Support" />
      </View>

      {/* About & Legal */}
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>About & Legal</Text></View>
      <View style={styles.sectionContainer}>
        <SettingsItem icon="document-text-outline" text="Terms of Service" />
        <SettingsItem icon="shield-checkmark-outline" text="Privacy Policy" />
        <SettingsItem icon="information-circle-outline" text="App Version" />
      </View>
    </ScrollView>
  );
};

const SettingsItem = ({ icon, text }) => (
  <TouchableOpacity style={styles.item}>
    <Ionicons name={icon} size={22} color={styles.iconColor.color} />
    <Text style={styles.itemText}>{text}</Text>
  </TouchableOpacity>
);

export default SettingsScreen;
