import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import CalendarComponent from './CalendarComponent';
import ServicesList from './ServicesList';
import { fetchUserServices } from '../DashboardAPI/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import styles from '../DashboardStyles/CalendarStyles';

const DashboardTab = () => {
  const [userServicesRec, setUserServicesRec] = useState([]);
  const [wellBeingPrompt, setWellBeingPrompt] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFullCalendarVisible, setFullCalendarVisible] = useState(true);

  useEffect(() => {
    const getServices = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const data = await fetchUserServices(token);
        setUserServicesRec(data);
      } catch (error) {
        console.error('Error fetching services recommendations:', error);
      }
    };

    getServices();

    const prompts = [
      'How are you feeling today?',
      'Need any support? Let us know!',
      "Take a moment for yourself. How's your mental health?",
    ];
    setWellBeingPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
  }, []);

  const renderEvent = ({ item }) => (
    <View style={styles.eventCard}>
      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text style={styles.eventTime}>{item.time}</Text>
    </View>
  );

  return (
    <FlatList
      data={[]} // Dummy data since FlatList requires `data`
      keyExtractor={() => 'dummy'} // Unique key
      ListHeaderComponent={
        <>
          {/* Current Day Section */}
          <View style={styles.currentDayContainer}>
            <Ionicons name="school-outline" size={50} color="#E4CFA3" />
            <Text style={styles.currentDayText}>
              {selectedDate instanceof Date
                ? `${selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                  })}, ${selectedDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                  })}, ${selectedDate.getFullYear()}`
                : 'Invalid Date'}
            </Text>
           
          </View>

          {/* Full Calendar Section */}
          {isFullCalendarVisible && (
            <View style={styles.fullCalendarContainer}>
              <CalendarComponent selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
            </View>
          )}
        </>
      }
      ListFooterComponent={
        <>
          {/* Services and Well-being */}
          <View style={styles.servicesContainer}>
            <ServicesList services={userServicesRec} />
          </View>
        </>
      }
      contentContainerStyle={styles.scrollViewContainer}
      nestedScrollEnabled // Enable nested scrolling for safety
    />
  );
};

export default DashboardTab;
