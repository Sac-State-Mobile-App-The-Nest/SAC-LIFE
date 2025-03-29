import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import defaultPFP from '../assets/defaultPFP.png'; // Profile picture
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from '../styles/ProfileStyles'; //new

const ProfileScreen = () => {
  const [userInfo, setUserInfo] = useState(null);

  // Displays the User's name by JWT authentication
  const displayUserFirstLastName = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`https://${process.env.DEV_BACKEND_SERVER_IP}/api/students/getName`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserInfo(response.data);
    } catch (error) {
      console.error('Error displaying user first and last name: ', error);
    }
  };

  useEffect(() => {
    displayUserFirstLastName();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.background}>
        <View style={styles.container}>
          <View style={styles.goldBackground}>
            {/* Profile Picture */}
            <Image source={defaultPFP} style={styles.profileImage} />

            {/* Profile Title */}
            <Text style={styles.header}>My Profile</Text>

            {/* Profile Name */}
            <Text style={styles.name}>
              {userInfo ? `${userInfo.f_name} ${userInfo.m_name ? `${userInfo.m_name} ` : ''}${userInfo.l_name}` : 'Loading Name'}
            </Text>

            {/* Profile Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detail}>johndoe@example.com</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone Number:</Text>
                <Text style={styles.detail}>123-456-7890</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Major:</Text>
                <Text style={styles.detail}>Computer Science</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Year:</Text>
                <Text style={styles.detail}>Undergraduate</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Student Type:</Text>
                <Text style={styles.detail}>Transfer</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
