// screens/SignUpScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../SignUpStyles/SignUpStyles';
import backgroundImage from '../assets/logInBackground.jpg';

const SignUpScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Apply smooth transition only for this screen
    React.useLayoutEffect(() => {
        navigation.setOptions({
            animation: 'none', 
        });
    }, [navigation]);

    const handleSignUp = () => {
        if (!username || !password || !confirmPassword) {
            Alert.alert('Error', 'All fields are required.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }
        Alert.alert('Sign-Up Clicked!', `Username: ${username}\nPassword: ${password}`);
    };

    return (
        <ImageBackground source={backgroundImage} style={styles.background}>
            <View style={styles.overlay}>
                <Text style={styles.title}>Create Your Account</Text>
                <View style={styles.box}>
                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        value={username}
                        onChangeText={setUsername}
                    />
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Password"
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
                    <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                        <Text style={styles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('LogIn')}>
                        <Text style={styles.linkText}>Already have an account? Log In</Text>
                    </TouchableOpacity>

                </View>
                
            </View>
        </ImageBackground>
    );
};

export default SignUpScreen;
