import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ImageBackground, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from '../styles/LoginStyles';
import PushNotificationService from '../notifications/PushNotificationService';
import BASE_URL from '../apiConfig';
import backgroundImage from '../assets/logInBackground.jpg'; 

const LogInScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const login = async () => {
    try {
      console.log("BASE_URL:", BASE_URL);

      const response = await axios.post(`${BASE_URL}/api/login_info/login`, { username, password });
      const { accessToken: token, userId } = response.data;

      await AsyncStorage.multiSet([
        ['token', token],
        ['username', username],
        ['userId', userId.toString()],
      ]);

      // Only now request notification permissions + register token
      await PushNotificationService.requestUserPermission(userId);
      PushNotificationService.listenForNotifications();

      const boolResponse = await axios.get(`${BASE_URL}/api/login_info/check-login-bool`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoading(false);

      if (boolResponse.data === true) {
        navigation.navigate('Dashboard');
      } else {
        navigation.navigate('ProfileCreation');
      }
    } catch (error) {
      setLoading(false);
      console.error("Login error:", error);

      if (error.response) {
        if (error.response.status === 403) {
          Alert.alert("Error", error.response.data.message);
        } else {
          Alert.alert("Login failed", error.response.data?.message || 'Unknown error');
        }
      } else {
        Alert.alert("Login failed", "An unexpected error occurred.");
      }
    }
  };

  const handleLogin = () => {
    setError('');
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
            testID="usernameInput"
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              testID="passwordInput"
            />
            <TouchableOpacity onPress={() => setShowPassword(prev => !prev)} style={styles.eyeIcon} testID="eyeIcon">
              <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={24} color="#6b6b6b" />
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

  
      </View>
    </ImageBackground>
  );
};

export default LogInScreen;
