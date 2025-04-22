// screens/Dashboard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import styles from '../styles/HomeStyles'; //new
import BASE_URL from '../apiConfig';
import axios from 'axios';
import styles from '../styles/VerificationScreenStyles';

const VerificationScreen = ({ navigation, route }) => {
    const { email } = route.params || {};

    const handleResend = async () => {
        if (!email) {
            Alert.alert('Error', 'Email address is missing');
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}/api/signup/resend-verification`, { email });
        } catch (err) {
            console.error('error:', err);
        }
    }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Please verify your email address.</Text>
      <TouchableOpacity style={styles.button} onPress={handleResend}>
        <Text style={styles.buttonText}>Resend Email</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('LogIn')}>
        <Text style={styles.buttonText}>Go to Login</Text>
      </TouchableOpacity>
      
    </View>
  );
};

export default VerificationScreen;
