import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image } from 'react-native';
import backgroundImage from '../assets/logInBackground.jpg';
import defaultPFP from '../assets/defaultPFP.png'; // Profile picture

const ProfileScreen = () => {
  return (
    <ImageBackground 
      source={backgroundImage} 
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.goldBackground}>
          {/* Profile Picture */}
          <Image source={defaultPFP} style={styles.profileImage} />

          {/* Profile Title */}
          <Text style={styles.header}>Profile</Text>

          {/* Profile Name */}
          <Text style={styles.name}>John M. Doe</Text>

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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  goldBackground: {
    backgroundColor: '#c4b581',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: '90%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    alignItems: 'center',
    position: 'relative',
    marginTop: 80,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 10,
    borderWidth: 4,
    borderColor: '#043927',
    position: 'absolute',
    top: -70,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#043927',
    marginTop: 80,
    marginBottom: 5,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#043927',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailsContainer: {
    alignSelf: 'stretch',
    paddingHorizontal: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  detailLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#043927',
  },
  detail: {
    fontSize: 18,
    color: '#043927',
  },
  editButton: {
    marginTop: 30,
    backgroundColor: '#043927',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
