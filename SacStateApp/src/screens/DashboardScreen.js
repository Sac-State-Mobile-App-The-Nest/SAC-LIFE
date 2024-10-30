// screens/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

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

  ////////
  const [retsentence, setretsentence] = useState('')
    //Services recommendation
  const fetchBackendMsg = async () => {
    try{
      const response = await fetch('http://10.0.0.21:5000/api/helloMessage');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const msg = await response.text();
      setretsentence(msg);
      console.log('Response: ', response)
      console.log('Msg: ', msg)
    } catch (error) {
      console.error('Error fetching data: ', error)
    }
  }
 ////////

  useEffect(() => {
    const prompts = [
      "How are you feeling today?",
      "Need any support? Let us know!",
      "Take a moment for yourself. How's your mental health?",
    ];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setWellBeingPrompt(randomPrompt);

    ////////
    fetchBackendMsg();
    ////////
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.activityContainer}>
      <Text style={styles.activityItem}>{item.activity}</Text>
      {item.activity === 'Viewed profile' && (
        <Button title="Go to Profile" onPress={() => navigation.navigate('Profile')} />
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
    <View style={styles.container}>
      <Text style={styles.header}>Welcome, {user.name}!</Text>
      <Text style={styles.subHeader}>{user.email}</Text>
      <Text style={styles.details}>Major: {user.major} | Year: {user.year}</Text>
      <Text style={styles.interests}>Interests: {user.interests.join(', ')}</Text>

      {/**dev **/}
      <Text style={styles.subHeader}>TEXT FROM BACKEND: {retsentence}</Text>


      <Text style={styles.sectionHeader}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
      />

      <Button title="Check In on Well-Being" onPress={handleWellBeingCheckIn} />

      <Text style={styles.sectionHeader}>Recent Activities</Text>
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 16,
    color: 'gray',
  },
  details: {
    fontSize: 16,
    marginVertical: 5,
  },
  interests: {
    fontSize: 16,
    marginVertical: 5,
    fontStyle: 'italic',
  },
  sectionHeader: {
    fontSize: 20,
    marginVertical: 10,
  },
  activityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  activityItem: {
    fontSize: 16,
  },
  notificationContainer: {
    paddingVertical: 10,
  },
  notificationItem: {
    fontSize: 16,
  },
  sectionHeader: {
    fontSize: 20,
    marginVertical: 10,
    fontWeight: 'bold', // Add this line to make the header bold
  },
});

export default DashboardScreen;
