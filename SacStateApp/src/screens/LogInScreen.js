// screens/LogInScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import backgroundImage from '../assets/logInBackground.jpg'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';
import styles from '../LoginStyles/LoginStyles'; //new

const LogInScreen = () => {
    const navigation = useNavigation(); // Hook to access the navigation object
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State for password visibility

    // Login function
    const login = async () => {
        try {
            const response = await axios.post(`http://${process.env.DEV_BACKEND_SERVER_IP}:5000/api/login_info/login`, { username, password, });   // Will add IP's to a .env file in the future
            const token = response.data.accessToken;

            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('username', username);

            const booleanResponse = await axios.get(`http://${process.env.DEV_BACKEND_SERVER_IP}:5000/api/login_info/check-login-bool`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            Alert.alert('Login successful');
            // If login is successful, navigate to homescreen
            if(booleanResponse.data == true) {
                navigation.navigate('Dashboard'); 
            } else {
                navigation.navigate('ProfileCreation'); 
            }
        } catch (error) {
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
        // Simulate a login process
        setTimeout(() => {
            setLoading(false);
            login();
        }, 2000);
    };

    const handleSkip = () => {
        navigation.navigate('Home'); 
    };

    return (
        <ImageBackground 
            source={ backgroundImage } 
            style={styles.background}
        >
            <View style={styles.overlay}>
                <Text style={styles.title}>Welcome to Sac State!</Text>
                <Text style={styles.subTitle}>Log in to access your personalized campus experience</Text>
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <View style={styles.box}>
                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        value={username}
                        onChangeText={setUsername}
                    />
                    <TextInput
                        style={styles.input} 
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                        style={styles.togglePasswordButton}
                        onPress={() => setShowPassword(prev => !prev)}
                    >
                        <Text style={styles.togglePasswordText}>
                            {showPassword ? 'Hide Password' : 'Show Password'}
                        </Text>
                    </TouchableOpacity>
                    {loading ? (
                        <ActivityIndicator size="large" color="#043927" /> // Sets the load spinners' size and color to green
                    ) : (
                        <TouchableOpacity style={styles.button} onPress={handleLogin}>
                            <Text style={styles.buttonText}>Log In</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                        <Text style={styles.skipButtonText}>Developer Skip Button</Text>
                    </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

export default LogInScreen;
