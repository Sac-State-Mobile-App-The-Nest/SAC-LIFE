// App.js
import React, { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LogInScreen from './src/screens/LogInScreen';
import ProfileCreationScreen from './src/screens/ProfileCreationScreen';
import WelcomeScreen from './src/screens/WelcomeScreen'; // Your welcome screen
import AllServicesScreen from './src/screens/AllServicesScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('hasSeenWelcome').then((value) => {
      if (value === null) {
        console.log("hasSeenWelcome flag: null (first launch)");
        // First launch: set flag and mark as first launch.
        setIsFirstLaunch(true);
        AsyncStorage.setItem('hasSeenWelcome', 'true');
      } else {
        console.log("hasSeenWelcome flag:", value);
        // Not first launch.
        setIsFirstLaunch(false);
      }
    });
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
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="LogIn" component={LogInScreen} />
        <Stack.Screen name="ProfileCreation" component={ProfileCreationScreen} />
        <Stack.Screen name="AllServices" component={AllServicesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
