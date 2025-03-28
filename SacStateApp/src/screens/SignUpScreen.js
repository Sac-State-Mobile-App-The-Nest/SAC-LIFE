// screens/SignUpScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../SignUpStyles/SignUpStyles';
import backgroundImage from '../assets/logInBackground.jpg';
import axios from 'axios';

const SignUpScreen = ({ navigation }) => {
    const [fName, setFName] = useState('');
    const [lName, setLName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            animation: 'none', 
        });
    }, [navigation]);

    const handleSignUp = async () => {
        if (!fName || !lName || !username || !password || !confirmPassword) {
            Alert.alert('Error', 'All fields are required.');
            return;
        }
        if (password.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters long.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`http://${process.env.DEV_BACKEND_SERVER_IP}:5000/signup`, {
                f_name: fName,
                l_name: lName,
                username,
                password,
            });

            if (response.status === 201) {
                Alert.alert('Success', 'Account created successfully!');
                navigation.navigate('LogIn');
            } else {
                Alert.alert('Error', response.data.message || 'Unexpected error');
            }
        } catch (error) {
            console.error('Sign-up error:', error);
            const message = error.response?.data?.message || 'Something went wrong. Try again.';
            Alert.alert('Sign-up failed', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground source={backgroundImage} style={styles.background}>
            <View style={styles.overlay}>
                <Text style={styles.title}>Create Your Account</Text>
                <View style={styles.box}>
                    <TextInput
                        style={styles.input}
                        placeholder="First Name"
                        value={fName}
                        onChangeText={setFName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Last Name"
                        value={lName}
                        onChangeText={setLName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        value={username}
                        onChangeText={setUsername}
                    />
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Password (min 8 characters)"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(prev => !prev)}
                            style={styles.eyeIcon}
                        >
                            <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={24} color="#6b6b6b" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Confirm Password"
                            secureTextEntry={!showPassword}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(prev => !prev)}
                            style={styles.eyeIcon}
                        >
                            <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={24} color="#6b6b6b" />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#043927" />
                    ) : (
                        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                            <Text style={styles.buttonText}>Sign Up</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity onPress={() => navigation.navigate('LogIn')}>
                        <Text style={styles.linkText}>Already have an account? Log In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
};

export default SignUpScreen;
