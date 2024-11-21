import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Linking, TouchableOpacity, Alert, ImageBackground, ScrollView, Image } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import ChatWidget from '../components/ChatWidget';
import backgroundImage from '../assets/logInBackground.jpg';
import logo from '../assets/sac-state-logo.png';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import ProfileScreen from './ProfileScreen';
import MessengerScreen from './MessengerScreen';
import SettingsScreen from './SettingsScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  //Fetch user services recommendations by using std_id
  const getUserServicesRec = async () => {
    try{
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`http://${process.env.DEV_BACKEND_SERVER_IP}:5000/api/campus_services/servicesRecommendation`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      setUserServicesRec(response.data);
    } catch(error){
      console.error('Error fetching services recommendations', error)
    }
  }

  useEffect(() => {
    getUserServicesRec();
    const prompts = [
      "How are you feeling today?",
      "Need any support? Let us know!",
      "Take a moment for yourself. How's your mental health?",
    ];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setWellBeingPrompt(randomPrompt);

    // Call getUser with login details
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

  const handlePress = (link) => {
    if (link) {
      Linking.openURL(link).catch((err) =>
        console.error('Failed to open link:', err)
      );
    }
  };
  
  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.goldBackground}>
          <Image source={logo} style={styles.logo} />

          <Text style={styles.welcomeHeader}></Text>

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
          <View style={styles.serviceContainer}>
            <Text style={styles.servicesHeader}>Services Available</Text>
            {userServicesRec.length === 0 ? (
              <Text style={styles.details}>No services available</Text>
            ) : (
              userServicesRec.map((service, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.serviceBox}
                  onPress={() => handlePress(service.service_link)}
                >
                  <Text style={styles.serviceTitle}>{service.serv_name}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
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
  welcomeHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'rgb(0, 46, 35)',
    marginTop: 10,
  },
  calendarContainer: {
    marginVertical: 20,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    marginBottom: 0,
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
  serviceContainer: {
    padding: 20,
  },
  servicesHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'rgb(0, 46, 35)',
  },
  details: {
    fontSize: 16,
    color: 'gray',
  },
  serviceBox: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    elevation: 3, // Adds a shadow effect for Android
    shadowColor: '#000', // Adds a shadow effect for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgb(0,132,83)', 
    textAlign: 'center',
  },
});

export default DashboardScreen;
