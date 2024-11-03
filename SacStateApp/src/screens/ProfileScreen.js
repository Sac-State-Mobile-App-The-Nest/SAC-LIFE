import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import backgroundImage from '../assets/logInBackground.jpg'; 

const ProfileScreen = () => {
  return (
    <ImageBackground 
      source={backgroundImage} 
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.goldBackground}>
          <Text style={styles.header}>Profile</Text>
          <Text style={styles.detail}>Name: John Doe</Text>
          <Text style={styles.detail}>Email: johndoe@example.com</Text>
          <Text style={styles.detail}>Phone Number: 123-456-7890</Text>
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
    padding: 20,
  },
  goldBackground: {
    backgroundColor: '#c4b581', // Sac State Gold
    padding: 20,
    borderRadius: 10, // Optional: for rounded corners
    width: '90%', // Adjust width as needed
    elevation: 5, // Optional: for shadow effect on Android
    shadowColor: '#000', // Optional: for shadow effect on iOS
    shadowOffset: { width: 0, height: 2 }, // Optional: for shadow effect on iOS
    shadowOpacity: 0.3, // Optional: for shadow effect on iOS
    shadowRadius: 4, // Optional: for shadow effect on iOS
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#043927', // Sac State Green
  },
  detail: {
    fontSize: 18,
    marginVertical: 5,
    color: '#043927', // Sac State Green
  },
});

export default ProfileScreen;
