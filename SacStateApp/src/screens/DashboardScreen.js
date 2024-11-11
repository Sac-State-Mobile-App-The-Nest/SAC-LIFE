import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ImageBackground, ScrollView, Image } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import ChatWidget from '../components/ChatWidget';
import backgroundImage from '../assets/logInBackground.jpg';
import logo from '../assets/sac-state-logo.png'; 

const DashboardScreen = () => {
  const navigation = useNavigation();

  const [userInfo, setUserInfo] = useState(null);
  const [userServicesRec, setUserServicesRec] = useState([]);
  const [wellBeingPrompt, setWellBeingPrompt] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [event, setEvent] = useState(null);
  const [isEventTabVisible, setEventTabVisible] = useState(false);
  const [markedDates, setMarkedDates] = useState({});

  const userLogin = {
    username: 'user1',
    password: 'hashed_password_123',
  };

  const user = {
    name: "John Doe",
    email: "johndoe@example.com",
    major: "Computer Science",
    year: "Sophomore",
    interests: ["Coding", "Music", "Sports"],
  };

  const activities = [
    { id: '1', activity: 'Viewed profile' },
    { id: '2', activity: 'Updated settings' },
  ];

  const notifications = [
    { id: '1', message: 'Assignment due tomorrow!' },
    { id: '2', message: 'Join the Coding Club meeting this Friday.' },
  ];

  const events = {
    '2024-11-10': { title: 'Meet with Professor Smith', description: 'Discussion on the upcoming project.' },
    '2024-11-15': { title: 'Coding Club Meeting', description: 'Join us for the weekly coding session.' },
    '2024-11-20': { title: 'Midterm Exam', description: 'Prepare for the midterm exam in your Computer Science course.' },
  };

  // Function to fetch user data by login info
  const getUser = async (userLoginData) => {
    try {
      const response = await fetch('http://10.0.0.21:5000/api/students/loginAndGetName', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userLoginData),
      });
      const data = await response.json();
      setUserInfo(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Fetch user services recommendations
  const getUserServicesRec = async (std_id) => {
    try {
      const response = await fetch(`http://10.0.0.21:5000/api/campus_services/${std_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      const data = await response.json();
      setUserServicesRec(data);
    } catch (error) {
      console.error('Error fetching service recommendations:', error);
    }
  };

  // Set well-being prompt and fetch user data on mount
  useEffect(() => {
    const prompts = [
      "How are you feeling today?",
      "Need any support? Let us know!",
      "Take a moment for yourself. How's your mental health?",
    ];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setWellBeingPrompt(randomPrompt);

    const fetchUser = async () => {
      await getUser(userLogin);
    };
    fetchUser();
  }, []);

  // Fetch user services after user info is fetched
  useEffect(() => {
    if (userInfo && userInfo.std_id) {
      getUserServicesRec(userInfo.std_id);
    }
  }, [userInfo]);

  // Function to handle day press in the calendar
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

  // Function to close the event tab and unmark the date
  const closeEventTab = () => {
    // Unmark the date when closing the event tab
    setMarkedDates({});
    setEventTabVisible(false);
    setEvent(null);
  };

  // Handle well-being check-in
  const handleWellBeingCheckIn = () => {
    Alert.alert("Well-Being Check", wellBeingPrompt);
  };

  // Render Activity Item
  const renderActivityItem = ({ item }) => (
    <View style={styles.activityContainer}>
      <Text style={styles.activityItem}>{item.activity}</Text>
      {item.activity === 'Viewed profile' && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={{ color: 'white' }}>Go to Profile</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Render Notification Item
  const renderNotificationItem = ({ item }) => (
    <View style={styles.notificationContainer}>
      <Text style={styles.notificationItem}>{item.message}</Text>
    </View>
  );

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.goldBackground}>
          <Image source={logo} style={styles.logo} />

          <Text style={styles.header}>
            Welcome, {userInfo ? `${userInfo.f_name} ${userInfo.m_name} ${userInfo.l_name}` : 'Loading Name'}!
          </Text>
          <Text style={styles.sectionHeader}>Notifications</Text>
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderNotificationItem}
          />
          <View style={styles.serviceContainer}>
            <Text style={styles.sectionHeader}>Services Available</Text>
            {userServicesRec.length === 0 ? (
              <Text style={styles.details}>No services available</Text>
            ) : (
              userServicesRec.map((service, index) => (
                <Text key={index} style={{ fontSize: 14 }}>
                  {service.serv_name}: {service.service_link}
                </Text>
              ))
            )}
          </View>

          {/* Event Popup Tab */}
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

          {/* Calendar */}
          <View style={styles.calendarContainer}>
            <Calendar
              onDayPress={handleDayPress}
              markedDates={markedDates}
              style={styles.calendar}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleWellBeingCheckIn}>
            <Text style={{ color: 'white' }}>Check In on Well-Being</Text>
          </TouchableOpacity>

          <Text style={styles.sectionHeader}>Recent Activities</Text>
          <FlatList
            data={activities}
            keyExtractor={(item) => item.id}
            renderItem={renderActivityItem}
          />

          <View style={styles.chatWidgetContainer}>
            <ChatWidget />
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
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
  sectionHeader: {
    fontSize: 20,
    marginVertical: 10,
    fontWeight: 'bold',
    color: '#043927',
  },
  activityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  activityItem: {
    fontSize: 16,
    color: '#043927',
  },
  notificationContainer: {
    paddingVertical: 10,
  },
  notificationItem: {
    fontSize: 16,
    color: '#043927',
  },
  button: {
    backgroundColor: '#043927',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
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
  chatWidgetContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
});

export default DashboardScreen;
