// App.js
import React, { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PushNotificationService from "./src/notifications/PushNotificationService";


import HomeScreen from './src/screens/HomeScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LogInScreen from './src/screens/LogInScreen';
import ProfileCreationScreen from './src/screens/ProfileCreationScreen';
import WelcomeScreen from './src/screens/WelcomeScreen'; // Your welcome screen
import AllServicesScreen from './src/screens/AllServicesScreen';
import WellnessScreen from './src/screens/WellnessScreen';
import WellnessHomeScreen from './src/screens/WellnessHomeScreen';


const Stack = createNativeStackNavigator();

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check AsyncStorage for first launch flag
        const value = await AsyncStorage.getItem("hasSeenWelcome");

        if (value === null) {
          console.log("hasSeenWelcome flag: null (first launch)");
          setIsFirstLaunch(true);
          await AsyncStorage.setItem("hasSeenWelcome", "true");
        } else {
          console.log("hasSeenWelcome flag:", value);
          setIsFirstLaunch(false);
        }

        // Initialize push notifications only AFTER checking AsyncStorage
        await PushNotificationService.requestUserPermission();
        PushNotificationService.listenForNotifications();
      } catch (error) {
        console.error("Error initializing app:", error);
      }
    };

    initializeApp();
  }, []);


  // While checking AsyncStorage, show a loading indicator.
  if (isFirstLaunch === null) {
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isFirstLaunch ? "Welcome" : "LogIn"}
        screenOptions={{ headerShown: false }}
      >
        {/* Include the Welcome screen only if it's the first launch */}
        {isFirstLaunch && (
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
        )}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="LogIn" component={LogInScreen} />
        <Stack.Screen name="ProfileCreation" component={ProfileCreationScreen} />
        <Stack.Screen name="AllServices" component={AllServicesScreen} />
        <Stack.Screen name="WellnessScreen" component ={WellnessScreen} />
        <Stack.Screen name= "WellnessHomeScreen" component ={WellnessHomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
