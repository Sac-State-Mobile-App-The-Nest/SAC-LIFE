import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DashboardTab from '../DashboardComponents/DashboardTab';
import SettingsScreen from './SettingsScreen';
import WellnessScreen from './WellnessScreen'; // Import WellnessScreen
import ChatbotScreen from './ChatbotScreen';

const Tab = createBottomTabNavigator();

const DashboardScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = 'home';
          else if (route.name === 'Profile') iconName = 'person';
          else if (route.name === 'Wellness') iconName = 'heart';
          else if (route.name === 'HerkyBot') iconName = 'chatbox-ellipses-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#E4CFA3',
        tabBarInactiveTintColor: '#B8C9B8',
        tabBarStyle: {
          backgroundColor: '#043927',
          borderTopColor: '#E4CFA3',
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: '#043927',
        },
        headerTitleStyle: {
          color: '#E4CFA3',
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardTab} options={{ headerShown: false }} />
      <Tab.Screen name="HerkyBot" component={ChatbotScreen} />
      <Tab.Screen name="Wellness" component={WellnessScreen} />
      <Tab.Screen name="Profile" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default DashboardScreen;

