// App.js
import React, { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
//import PushNotificationService, { registerForegroundHandler } from "./src/notifications/PushNotificationService";
import Toast from 'react-native-toast-message';
import { Text, TouchableOpacity, View } from 'react-native';



import HomeScreen from './src/screens/HomeScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LogInScreen from './src/screens/LogInScreen';
import ProfileCreationScreen from './src/screens/ProfileCreationScreen';
import WelcomeScreen from './src/screens/WelcomeScreen'; 
import AllServicesScreen from './src/screens/AllServicesScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import WellnessScreen from './src/screens/WellnessScreen';
import WellnessHomeScreen from './src/screens/WellnessHomeScreen';
import VerificationScreen from './src/screens/VerificationScreen';


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

        // // Initialize push notifications only AFTER checking AsyncStorage
        // registerForegroundHandler();
        // const userId = await AsyncStorage.getItem("userId");
        // await PushNotificationService.requestUserPermission(userId);
        // PushNotificationService.listenForNotifications();
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
    <>
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

        <Stack.Screen name="SignUp" component={SignUpScreen} />

        <Stack.Screen name="WellnessScreen" component ={WellnessScreen} />
        <Stack.Screen name= "WellnessHomeScreen" component ={WellnessHomeScreen} />
        <Stack.Screen name= "VerificationScreen" component ={VerificationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    <Toast config={customToastConfig} />

  </>
  );
}

const customToastConfig = {
  sacLifeNotification: ({ text1, text2, onPress, hide }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#043927',
        borderLeftColor: '#E4CFA3',
        borderLeftWidth: 6,
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 10,
        marginTop: 10,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
      }}
    >
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#E4CFA3' }}>{text1}</Text>
        <Text style={{ fontSize: 14, color: '#ffffff' }}>{text2}</Text>
      </View>
      <TouchableOpacity onPress={hide}>
        <Text style={{ fontSize: 18, color: '#E4CFA3', paddingHorizontal: 8 }}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )
};

