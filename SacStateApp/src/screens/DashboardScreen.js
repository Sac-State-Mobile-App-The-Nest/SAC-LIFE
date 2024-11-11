import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ImageBackground, ScrollView, Image } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import ChatWidget from '../components/ChatWidget';
import backgroundImage from '../assets/logInBackground.jpg';
import logo from '../assets/sac-state-logo.png';
import { Ionicons } from '@expo/vector-icons';

import ProfileScreen from './ProfileScreen';
import MessengerScreen from './MessengerScreen';
import SettingsScreen from './SettingsScreen';

const Tab = createBottomTabNavigator();

const DashboardTab = () => {
  const navigation = useNavigation();

  const [userInfo, setUserInfo] = useState(null);
  const [userServicesRec, setUserServicesRec] = useState([]);
  const [wellBeingPrompt, setWellBeingPrompt] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [event, setEvent] = useState(null);
  const [isEventTabVisible, setEventTabVisible] = useState(false);
  const [markedDates, setMarkedDates] = useState({});

  // Define the events object here
  const events = {
    '2024-11-10': { title: 'Meet with Professor Smith', description: 'Discussion on the upcoming project.' },
    '2024-11-15': { title: 'Coding Club Meeting', description: 'Join us for the weekly coding session.' },
    '2024-11-20': { title: 'Midterm Exam', description: 'Prepare for the midterm exam in your Computer Science course.' },
  };

  const userLogin = {
    username: 'user1',
    password: 'hashed_password_123',
  };

  // Fetch user data from the backend API
  const getUser = async (userLoginData) => {
    try {
      const response = await fetch('http://192.168.1.223:5000/api/students/loginAndGetName', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userLoginData),
      });
      const data = await response.json();

      if (response.ok) {
        setUserInfo(data); // Successfully set the user information
      } else {
        Alert.alert('Login Error', data.message || 'Unable to retrieve user information.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to fetch user data.');
    }
  };

  useEffect(() => {
    const prompts = [
      "How are you feeling today?",
      "Need any support? Let us know!",
      "Take a moment for yourself. How's your mental health?",
    ];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setWellBeingPrompt(randomPrompt);

    // Call getUser with login details
    getUser(userLogin);
  }, []);

  const handleWellBeingCheckIn = () => {
    Alert.alert("Well-Being Check", wellBeingPrompt);
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    const eventForDay = events[day.dateString] || null;
    setEvent(eventForDay);
    setEventTabVisible(eventForDay !== null);

    // Mark the selected date on the calendar
    setMarkedDates({
      [day.dateString]: { selected: true, marked: true, selectedColor: 'blue' }
    });
  };

  const closeEventTab = () => {
    setMarkedDates({});
    setEventTabVisible(false);
    setEvent(null);
  };

  
  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.goldBackground}>
          <Image source={logo} style={styles.logo} />

          <Text style={styles.header}>
            Welcome, {userInfo ? `${userInfo.f_name} ${userInfo.m_name} ${userInfo.l_name}` : 'Loading Name'}!
          </Text>

          <View style={styles.calendarContainer}>
            <Calendar
              onDayPress={handleDayPress}
              markedDates={markedDates}
              style={styles.calendar}
            />
          </View>

          {isEventTabVisible && event && (
            <View style={styles.eventTab}>
              <Text style={styles.eventDate}>{selectedDate}</Text>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDescription}>{event.description}</Text>
              <TouchableOpacity onPress={closeEventTab} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={() => Alert.alert("Well-Being Check", wellBeingPrompt)}>
            <Text style={{ color: 'white' }}>Check In on Well-Being</Text>
          </TouchableOpacity>

          <View style={styles.chatWidgetContainer}>
            <ChatWidget />
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const DashboardScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = 'home';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else if (route.name === 'Messenger') {
            iconName = 'chatbubble-ellipses';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#e6b711',
        tabBarInactiveTintColor: 'grey',
        tabBarStyle: {
          backgroundColor: '#021e14',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardTab} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Messenger" component={MessengerScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  scrollViewContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  goldBackground: {
    backgroundColor: '#c4b581',
    padding: 20,
    borderRadius: 10,
    flex: 1,
    alignSelf: 'stretch',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logo: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: 20,
    left: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 80,
  },
  calendarContainer: {
    marginVertical: 20,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  eventTab: {
    position: 'absolute',
    top: 100, 
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
  },
  eventDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#043927',
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#043927',
  },
  eventDescription: {
    fontSize: 16,
    color: '#043927',
    marginTop: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#043927',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
  },
  button: {
    backgroundColor: '#043927',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  chatWidgetContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
});

export default DashboardScreen;
