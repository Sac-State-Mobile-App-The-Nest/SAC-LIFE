// screens/LogInScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import backgroundImage from '../assets/logInBackground.jpg'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';
import styles from '../styles/LoginStyles';
//import PushNotificationService from '../notifications/PushNotificationService';

import BASE_URL from '../apiConfig.js';

const LogInScreen = () => {
    const navigation = useNavigation(); 
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false); 

    // Login function
    const login = async () => {
        try {
            console.log("BASE_URL:", BASE_URL);
            const response = await axios.post(`${BASE_URL}/api/login_info/login`, { username, password, });   // Will add IP's to a .env file in the future
            const token = response.data.accessToken;
            const userId = response.data.userId; 

            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('username', username);
            await AsyncStorage.setItem('userId', userId.toString());

            const fcmToken = await PushNotificationService.getToken();
            if (!fcmToken) {
                console.error("FCM token was not saved to backend.");
              } else {
                console.log("FCM token registered successfully.");
              }
            const booleanResponse = await axios.get(`${BASE_URL}/api/login_info/check-login-bool`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setLoading(false);

            Alert.alert('Login successful');
            // If login is successful, navigate to homescreen
            if(booleanResponse.data == true) {
                navigation.navigate('Dashboard'); 
            } else {
                navigation.navigate('ProfileCreation'); 
            }
        } catch (error) {
            if (error.response && error.response.status === 403){
                Alert.alert("Error", error.response.data.message);
                return;
            }
            // Handle the error case
            if (error.response && error.response.data) {
                Alert.alert('Login failed', error.response.data);
            } else {
                Alert.alert('Login failed', 'An unexpected error occurred.');
            }
        console.error("Error logging in:", error.message);
    }
};


    // Send in username/password and run through the POST request for validation
    // Redirect to the corresponding pages
    const handleLogin = () => {
        setError(''); // Clear previous errors
        if (!username || !password) {
            setError('Username and password are required.');
            return;
        }
        
        setLoading(true);
        login();
    };

    const handleSkip = () => {
        navigation.navigate('Home'); 
    };

    return (
        <ImageBackground source={backgroundImage} style={styles.background}>
            <View style={styles.overlay}>
                <Text style={styles.title}>Sac LIFE</Text>
                <Text style={styles.subTitle}>Your Campus. Your Experience.</Text>
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <View style={styles.box}>
                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        value={username}
                        onChangeText={setUsername}
                        testID="usernameInput"  // Added testID here for username input
                    />
                    
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            testID="passwordInput"  // Added testID here for password input
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(prev => !prev)}
                            style={styles.eyeIcon}
                            testID="eyeIcon" // Added testID here for the eye icon (password visibility toggle)
                        >
                            <Icon 
                                name={showPassword ? 'visibility' : 'visibility-off'} 
                                size={24} 
                                color="#6b6b6b"
                            />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator testID="loadingIndicator" size="large" color="#043927" />
                    ) : (
                        <>
                        <TouchableOpacity style={styles.button} onPress={handleLogin} testID="loginButton">
                            <Text style={styles.buttonText}>Log In</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('SignUp')} testID="signUpLink">
                            <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
                        </TouchableOpacity>
                        </>
                    )}
                </View>
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip} testID="skipButton">
                    <Text style={styles.skipButtonText}>Developer Skip Button</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

export default LogInScreen;
