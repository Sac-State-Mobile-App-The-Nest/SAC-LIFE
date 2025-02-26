// screens/SettingScreen.js
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../SettingsStyles/SettingsStyles'; // Import styles

const SettingsScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <TouchableOpacity style={styles.profileBox} onPress={() => navigation.navigate('Profile')}>
        <Ionicons name="person-circle-outline" size={50} color={styles.iconColor.color} style={styles.profileIcon} />
        <View>
          <Text style={styles.profileName}>John Doe</Text>
          <Text style={styles.profileEmail}>johndoe@example.com</Text>
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
