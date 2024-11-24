import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import defaultPFP from '../assets/defaultPFP.png'; // Profile picture
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const ProfileScreen = () => {
  const [userInfo, setUserInfo] = useState(null);

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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Matches the background color for a seamless look
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5', // Subtle light gray for a clean and soft background
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: 20, // Add padding to avoid top cutoff
  },
  goldBackground: {
    backgroundColor: '#FBF8EF', // Faded Sac State gold
    paddingVertical: 80,
    paddingHorizontal: 20,
    borderRadius: 25, // Slightly larger rounding for a modern feel
    width: '90%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15, // Softer shadow for elegance
    shadowRadius: 8,
    alignItems: 'center',
    position: 'relative',
    marginTop: 20, // Reduced margin to align better
    borderColor: '#E4CFA3', // Muted gold border
    borderWidth: 1,
  },
  profileImage: {
    width: 150, // Slightly larger profile picture
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
    borderWidth: 4,
    borderColor: '#043927', // Sac State green for contrast
    position: 'absolute',
    top: 5,
  },
  header: {
    fontSize: 28, // Larger font for emphasis
    fontWeight: 'bold',
    color: '#043927',
    marginTop: 90, // Adjusted for larger profile picture
    marginBottom: 10,
    textShadowColor: '#E4CFA3', // Subtle gold shadow
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  name: {
    fontSize: 24, // Slightly larger font for readability
    fontWeight: '600',
    color: '#043927',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailsContainer: {
    alignSelf: 'stretch',
    paddingHorizontal: 20, // Increased padding for a more spacious layout
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8, // Slightly increased spacing for better readability
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E4CFA3', // Muted gold for section separation
  },
  detailLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#043927',
    width: '45%',
  },
  detail: {
    fontSize: 18,
    color: '#043927',
    width: '55%',
    textAlign: 'right',
  },
  editButton: {
    marginTop: 30,
    backgroundColor: '#043927', // Sac State green for emphasis
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderColor: '#E4CFA3', // Gold outline
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 18, // Larger font for better visibility
    color: '#FBF8EF', // Use faded gold text for contrast
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default ProfileScreen;
