// screens/LogInScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import backgroundImage from '../assets/logInBackground.jpg'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';

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

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Slightly darker overlay for better readability
        width: '100%',
        padding: 16,
    },
    title: {
        fontSize: 28, // Prominent but not overpowering
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#E4CFA3', // Faded gold for a warmer, softer tone
        textShadowColor: 'rgba(0, 0, 0, 0.6)', // Slightly darker shadow for contrast
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        textAlign: 'center',
    },
    subTitle: {
        fontSize: 16, // Subtle yet readable
        fontWeight: '400',
        color: '#E4CFA3', // Muted gold for harmony
        textShadowColor: 'rgba(0, 0, 0, 0.4)', // Soft shadow for readability
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        marginBottom: 20,
        textAlign: 'center',
    },
    box: {
        backgroundColor: 'rgba(43, 58, 50, 0.8)', // Muted dark green with transparency
        borderRadius: 20, // Modern rounded edges
        padding: 25,
        width: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15, // Softer shadow
        shadowRadius: 6,
        elevation: 6,
        alignItems: 'center',
        borderColor: 'rgba(251, 248, 239, 0.5)', // Subtle faded gold border for elegance
        borderWidth: 1.5,
    },
    input: {
        height: 45,
        borderColor: 'rgba(251, 248, 239, 0.8)', // Faded gold for harmony
        borderWidth: 1.5,
        marginBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slightly more opaque white
        borderRadius: 8,
        width: '100%',
        fontSize: 16,
        color: '#043927', // Dark green for better readability
    },
    togglePasswordButton: {
        backgroundColor: 'rgba(4, 57, 39, 0.8)', // Muted Sac State green
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
        width: '100%',
    },
    togglePasswordText: {
        color: '#FDF6E4', // Soft cream for harmony
        fontSize: 16,
        fontWeight: '600',
    },
    error: {
        color: '#ff4d4d', // Bright red for visibility
        marginBottom: 12,
        fontSize: 14,
        textAlign: 'center',
    },
    button: {
        backgroundColor: 'rgba(4, 57, 39, 0.9)', // Muted dark green
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
        borderColor: 'rgba(251, 248, 239, 0.5)', // Subtle faded gold border
        borderWidth: 1.5,
    },
    buttonText: {
        color: '#FDF6E4', // Soft cream text for better harmony
        fontSize: 18,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    skipButton: {
        position: 'absolute', // Keeps it in the top-right corner
        top: 50,
        right: 20,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
        backgroundColor: 'rgba(251, 248, 239, 0.8)', // Faded gold for subtle presence
    },
    skipButtonText: {
        color: '#043927', // Dark green text for contrast
        fontSize: 16,
        fontWeight: '600',
    },
});


export default LogInScreen;
