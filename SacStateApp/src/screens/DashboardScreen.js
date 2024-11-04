// screens/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert, ImageBackground, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import ChatWidget from '../components/ChatWidget';
import backgroundImage from '../assets/logInBackground.jpg'; 

const DashboardScreen = () => {
  const navigation = useNavigation();

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

  const [wellBeingPrompt, setWellBeingPrompt] = useState(null);

  //mimmic a fake user to login - this is an actual user from the database
  //actual user is used to test for backend functionality on verifying login
  const userLogin = {
    username: 'user1', 
    password: 'hashed_password_123'
  };
  //user information that will be displayed - f_name, m_name, l_name, std_id
  const [userInfo, setUserInfo] = useState(null);
  //user services recommendation
  const [userServicesRec, setUserServicesRec] = useState([]);
  //Fetch user info by passing in login info to backend, backend will verify if user exists and sends back the std_id
  const getUser = async (userLoginData) => {
    try{
      const response = await fetch('http://10.0.0.21:5000/api/students/loginAndGetName', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userLoginData), //data being sent to backend
      });
      const data = await response.json(); // parse Json response
      setUserInfo(data);
    } catch(error){
      console.error('Error fetching user: ', error)
    }
  }
  //Fetch user services recommendations by using std_id
  const getUserServicesRec = async (std_id) => {
    try{
      const response = await fetch(`http://10.0.0.21:5000/api/campus_services/${std_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      //json response will be a list of services recommended - serv_name, service_desc, and service_link
      const data = await response.json();
      setUserServicesRec(data);
    } catch(error){
      console.error('Error fetching services recommendations', error)
    }
  }

  //Loads when page loads
  useEffect(() => {
    const prompts = [
      "How are you feeling today?",
      "Need any support? Let us know!",
      "Take a moment for yourself. How's your mental health?",
    ];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setWellBeingPrompt(randomPrompt);

    //takes user login and verifies it
    const fetchUser = async () => {
      await getUser(userLogin);
    };
    fetchUser();
  }, []);
  //waits for user login to be verified and std_id to be sent back here before executing
  useEffect(() => {
    if (userInfo && userInfo.std_id){
      //calls method to get recommended services based on std_id
      getUserServicesRec(userInfo.std_id);
    }
  }, [userInfo])

  

  const renderItem = ({ item }) => (
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

  const renderNotification = ({ item }) => (
    <View style={styles.notificationContainer}>
      <Text style={styles.notificationItem}>{item.message}</Text>
    </View>
  );

  const handleWellBeingCheckIn = () => {
    Alert.alert("Well-Being Check", wellBeingPrompt);
  };

  return (
       <ImageBackground 
            source={ backgroundImage } 
            style={styles.background}
        >
  <ScrollView contentContainerStyle={styles.scrollViewContainer}>   
    <View style={styles.goldBackground}>
      <Text style={styles.header}>Welcome, {userInfo ? `${userInfo.f_name} ${userInfo.m_name} ${userInfo.l_name}`: 'Loading Name'}!</Text>
      {/* <Text style={styles.header}>Welcome, {user.name}!</Text>
      <Text style={styles.subHeader}>{user.email}</Text> */}
      <Text style={styles.details}>Major: {user.major}</Text>
      <Text style={styles.details}>Year: {user.year}</Text>
      {/* <Text style={styles.interests}>Interests: {user.interests.join(', ')}</Text> */}

      {/**dev **/}
      
      <Text style={styles.subHeader}>Student ID: {userInfo ? `${userInfo.std_id}`: 'Loading ID'}</Text>
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
       <View style={styles.calendarContainer}>
                <Calendar
                    onDayPress={(day) => {
                        console.log('selected day', day);
                        // You can add your logic for when a day is pressed
                    }}
                    markedDates={{
                        '2024-11-01': { selected: true, marked: true, selectedColor: 'blue' },
                        // Add more dates here as needed
                    }}
                    style={styles.calendar}
                />
            </View>


      <Text style={styles.sectionHeader}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleWellBeingCheckIn}
      >
        <Text style={{ color: 'white' }}>Check In on Well-Being</Text>
      </TouchableOpacity>

      <Text style={styles.sectionHeader}>Recent Activities</Text>
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
      <View style={stylesC.chatWidgetContainer}>
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
    backgroundColor: '#F7F7F7', // Light background for contrast
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
  scrollViewContainer: {
    flexGrow: 1, // Ensures the content is fully scrollable
    paddingBottom: 20, // Optional: add some padding at the bottom
  },
  serviceContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  goldBackground: {
    backgroundColor: '#c4b581', // Sac State Gold
    padding: 20,
    borderRadius: 10,
    flex: 1, // This allows the container to take the available space
    alignSelf: 'stretch', // This makes it stretch to the edges
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black', // Sac State Green
  },
  subHeader: {
    fontSize: 16,
    color: '#c4b581', // Sac State Gold
  },
  details: {
    fontSize: 16,
    marginVertical: 5,
    color: '#043927', // Sac State Green
  },
  sectionHeader: {
    fontSize: 20,
    marginVertical: 10,
    fontWeight: 'bold',
    color: '#043927', // Sac State Green
  },
  activityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  activityItem: {
    fontSize: 16,
    color: '#043927', // Sac State Green
  },
  notificationContainer: {
    paddingVertical: 10,
  },
  notificationItem: {
    fontSize: 16,
    color: '#043927', // Sac State Green
  },
  button: {
    backgroundColor: '#043927', // Sac State Green
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white', // Text color for buttons
    fontSize: 16,
  },
});
const stylesC = StyleSheet.create({
  chatWidgetContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000, // Ensures it stays on top of other elements
  },
});

export default DashboardScreen;
