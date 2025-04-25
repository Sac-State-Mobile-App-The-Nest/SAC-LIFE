// screens/Dashboard.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import styles from '../styles/HomeStyles'; //new

const Dashboard = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text>Sac State Life</Text>
      <Button
        title="Go to Dashboard"
        onPress={() => navigation.navigate('Dashboard')}
      />
      <Button
        title="Go to Log In"
        onPress={() => navigation.navigate('LogIn')}
      />
       <Button
        title="Go to Profile Creation"
        onPress={() => navigation.navigate('ProfileCreation')}
      />
      <Button
        title="Go to Email Verification"
        onPress={() => navigation.navigate('VerificationScreen')}
      />
      
    </View>
    
    
  );
};

export default Dashboard;
