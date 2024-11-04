import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LogInScreen from './src/screens/LogInScreen';
import { StatusBar } from 'expo-status-bar';
import Questionnaire from './src/screens/Questionnaire';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LogIn">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="LogIn" component={LogInScreen}/>
        <Stack.Screen name="Questionnaire" component = {Questionnaire}/>
      </Stack.Navigator>
        
    </NavigationContainer>   
  );
  
}

