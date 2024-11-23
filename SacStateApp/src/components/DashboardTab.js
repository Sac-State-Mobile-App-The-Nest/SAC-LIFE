import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import CalendarComponent from './CalendarComponent'; // Import the CalendarComponent
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
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to today's date
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
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      {/* Current Day Section */}
      <View style={styles.currentDayContainer}>
        <Ionicons name="school-outline" size={50} color="#E4CFA3" />
        <Text style={styles.currentDayText}>
          {/* Display the day and month */}
          {selectedDate instanceof Date
            ? `${selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
              })}, ${selectedDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
              })}`
            : 'Invalid Date'}
        </Text>
        {selectedDate instanceof Date && (
          <Text style={styles.centeredYearText}>
            {/* Display the year in the center */}
            {selectedDate.getFullYear()}
          </Text>
        )}

        {/* Replacing Expand/Collapse Text Button with Calendar Icon Button */}
        <TouchableOpacity
          style={styles.topRightIcon} // Use the topRightIcon style for positioning
          onPress={() => setFullCalendarVisible(!isFullCalendarVisible)}
        >
          <Ionicons
            name={isFullCalendarVisible ? 'calendar-outline' : 'calendar-sharp'}
            size={28} // Adjust icon size
            color="#E4CFA3" // Subtle muted gold
          />
        </TouchableOpacity>
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
          />
        ) : (
          <Text style={styles.noEventsText}>No events scheduled for today</Text>
        )}
      </View>

      {/* Services and Well-being */}
      <View style={styles.servicesContainer}>
        <ServicesList services={userServicesRec} />
        <WellBeingButton prompt={wellBeingPrompt} />
      </View>

      {/* Chat Widget */}
      <ChatWidget />
    </ScrollView>
  );
};

export default DashboardTab;
