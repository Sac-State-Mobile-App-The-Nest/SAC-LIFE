import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DashboardTab from '../DashboardComponents/DashboardTab';
import SettingsScreen from './SettingsScreen';
import WellnessHomeScreen from './WellnessHomeScreen'; 
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
        tabBarBackground: () => (
          <View style={{ flex: 1 }}>
            <LinearGradient
              colors={['#043927', '#06442F']} // ✅ Gradient applied here
              style={{ flex: 1 }}
            />
          </View>
        ),
        headerBackground: () => (
          <View style={{ flex: 1 }}>
            <LinearGradient
              colors={['#043927', '#0B6845']} // ✅ Gradient applied to header
              style={{ flex: 1 }}
            />
          </View>
        ),

      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardTab} options={{ headerShown: false }} />
      <Tab.Screen name="HerkyBot" component={ChatbotScreen} />
      <Tab.Screen name="Wellness" component={WellnessHomeScreen} />
      <Tab.Screen name="Wellness" component={WellnessHomeScreen} />
      <Tab.Screen name="Profile" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default DashboardScreen;

