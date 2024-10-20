// screens/ProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>
      <Text style={styles.detail}>Name: John Doe</Text>
      <Text style={styles.detail}>Email: johndoe@example.com</Text>
     <Text style={styles.detail}>Phone Number: 123-456-7890</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  detail: {
    fontSize: 18,
    marginVertical: 5,
  },
});

export default ProfileScreen;
