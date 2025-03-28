// screens/Dashboard.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import styles from '../HomeStyles/HomeStyles'; //new

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
      
    </View>
    
    
  );
};

export default Dashboard;
