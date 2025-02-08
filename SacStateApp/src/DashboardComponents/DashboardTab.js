import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import CalendarComponent from './CalendarComponent';
import ServicesList from './ServicesList';
import WellBeingButton from './WellBeingButton';
import ChatWidget from './ChatWidget';
import { fetchUserServices } from '../DashboardAPI/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import styles from '../DashboardStyles/CalendarStyles';

const DashboardTab = () => {
  const [userServicesRec, setUserServicesRec] = useState([]);
  const [wellBeingPrompt, setWellBeingPrompt] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [isFullCalendarVisible, setFullCalendarVisible] = useState(true);

  useEffect(() => {
    // Fetch events for the current day
    const currentDayEvents = [
      { title: 'Project Meeting', time: '2:00 PM - 3:00 PM' },
      { title: 'Workshop: AI in Education', time: '4:00 PM - 5:30 PM' },
    ];
    setEvents(currentDayEvents);

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

          {/* Events Section */}
          <View style={styles.eventsContainer}>
            <Text style={styles.sectionTitle}>Today's Events</Text>
            {events.length > 0 ? (
              <FlatList
                data={events}
                renderItem={renderEvent}
                keyExtractor={(item, index) => index.toString()}
                nestedScrollEnabled // Allow nested scrolling
              />
            ) : (
              <Text style={styles.noEventsText}>No events scheduled for today</Text>
            )}
          </View>
        </>
      }
      ListFooterComponent={
        <>
          {/* Services and Well-being */}
          <View style={styles.servicesContainer}>
            <ServicesList services={userServicesRec} />
            <WellBeingButton prompt={wellBeingPrompt} />
          </View>

          {/* Chat Widget */}
          <ChatWidget />
        </>
      }
      contentContainerStyle={styles.scrollViewContainer}
      nestedScrollEnabled // Enable nested scrolling for safety
    />
  );
};

export default DashboardTab;
