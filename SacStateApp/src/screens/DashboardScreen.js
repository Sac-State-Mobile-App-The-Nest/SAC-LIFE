import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DashboardTab from '../components/DashboardTab';
import ProfileScreen from './ProfileScreen';
import SettingsScreen from './SettingsScreen';

const Tab = createBottomTabNavigator();

const DashboardScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = 'home';
          else if (route.name === 'Profile') iconName = 'person';
          else if (route.name === 'Settings') iconName = 'settings';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#E4CFA3', // Subtle muted gold for active icons
        tabBarInactiveTintColor: '#B8C9B8', // Green-gray for inactive icons
        tabBarStyle: {
          backgroundColor: '#043927', // Sac State green background
          borderTopColor: '#E4CFA3', // Subtle gold border at the top
          borderTopWidth: 1, // Slight border for separation
          shadowColor: '#000', // Slight shadow for floating effect
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerStyle: {
          backgroundColor: '#043927', // Sac State green for header background
        },
        headerTitleStyle: {
          color: '#E4CFA3', // Subtle muted gold for header title
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardTab} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default DashboardScreen;
