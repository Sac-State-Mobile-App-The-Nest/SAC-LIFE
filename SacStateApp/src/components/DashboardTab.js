import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import FullCalendar from './FullCalendar'; // Import the FullCalendar component
import ServicesList from './ServicesList';
import WellBeingButton from './WellBeingButton';
import ChatWidget from './ChatWidget';
import { fetchUserServices } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/CalendarStyles'; // Use CalendarStyles.js for calendar-related styles

const DashboardTab = () => {
  const [userServicesRec, setUserServicesRec] = useState([]);
  const [wellBeingPrompt, setWellBeingPrompt] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());
  const [events, setEvents] = useState([]);
  const [isFullCalendarVisible, setFullCalendarVisible] = useState(false);

  useEffect(() => {
    // Fetch events for the current day
    const currentDayEvents = [
      { title: 'Project Meeting', time: '2:00 PM - 3:00 PM' },
      { title: 'Workshop: AI in Education', time: '4:00 PM - 5:30 PM' },
    ];
    setEvents(currentDayEvents);

    const getServices = async () => {
      const token = await AsyncStorage.getItem('token');
      const data = await fetchUserServices(token);
      setUserServicesRec(data);
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
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      {/* Current Day Section */}
      <View style={styles.currentDayContainer}>
        <Ionicons name="school-outline" size={50} color="#fff" />
        <Text style={styles.currentDayText}>
          {new Date(selectedDate).toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
          })}
        </Text>
        <TouchableOpacity
          onPress={() => setFullCalendarVisible(!isFullCalendarVisible)}
          style={styles.expandButton}
        >
          <Text style={styles.expandButtonText}>
            {isFullCalendarVisible ? 'Collapse Calendar' : 'Expand Calendar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Full Calendar Section */}
      {isFullCalendarVisible && (
        <View style={styles.fullCalendarContainer}>
          <FullCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
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
          />
        ) : (
          <Text style={styles.noEventsText}>No events scheduled for today</Text>
        )}
      </View>

      {/* Services and Well-being */}
      <ServicesList services={userServicesRec} />
      <WellBeingButton prompt={wellBeingPrompt} />

      {/* Chat Widget */}
      <ChatWidget />
    </ScrollView>
  );
};

export default DashboardTab;
