import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, TouchableOpacity, Text, Animated, Dimensions, Modal, TextInput, Button, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../DashboardStyles/CalendarStyles';

const CalendarComponent = ({ selectedDate, setSelectedDate }) => {
  const [currentWeek, setCurrentWeek] = useState([]);
  const [isFullCalendarVisible, setFullCalendarVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date()); // Initialize to today's date
  const [lastClickTime, setLastClickTime] = useState(0); // Track last click time
  const [isModalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [eventTitle, setEventTitle] = useState(''); // Event title state
  const [eventDescription, setEventDescription] = useState(''); // Event description state
  const [eventDate, setEventDate] = useState(null); // Store the selected date for the event
  const [eventToEdit, setEventToEdit] = useState(null); // Store the event that is being edited
  const [events, setEvents] = useState([]); // Store events in an array
  const [selectedDayEvents, setSelectedDayEvents] = useState([]); // Store events for the selected day
  const animationHeight = useRef(new Animated.Value(0)).current;

  const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
  const fullCalendarHeight = screenHeight * 0.5; // Dropdown height is half the screen

  useEffect(() => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const week = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return {
        day: date.getDate(),
        dateObject: date,
        isToday: date.toDateString() === new Date().toDateString(),
      };
    });
    setCurrentWeek(week);
  }, []);

  const toggleCalendar = () => {
    setFullCalendarVisible(!isFullCalendarVisible);
    Animated.timing(animationHeight, {
      toValue: isFullCalendarVisible ? 0 : fullCalendarHeight,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const handleDayPress = (day) => {
    const currentTime = new Date().getTime();
    
    // Check if it's a double-click
    if (currentTime - lastClickTime < 500) { // Double-click within 500ms
      openEventModal(day); // Open event creation modal
    } else {
      setSelectedDate(day.dateObject);
      setSelectedDayEvents(getEventsForDate(day.dateObject)); // Get events for the tapped day
    }

    setLastClickTime(currentTime); // Update last click time
  };

  const openEventModal = (day, event = null) => {
    setEventDate(day.dateObject); // Set the date for the event
    if (event) {
      // If editing an existing event, pre-fill the modal with the event data
      setEventToEdit(event); // Store the event to be edited
      setEventTitle(event.title);
      setEventDescription(event.description);
    } else {
      // Clear fields for creating a new event
      setEventToEdit(null);
      setEventTitle('');
      setEventDescription('');
    }
    setModalVisible(true); // Open the modal
  };

  const closeEventModal = () => {
    setModalVisible(false); // Close the modal
    setEventTitle(''); // Clear event title
    setEventDescription(''); // Clear event description
    setEventDate(null); // Clear event date
    setEventToEdit(null); // Clear event to edit state
  };

  const saveEvent = () => {
    if (eventTitle.trim() && eventDescription.trim()) {
      const newEvent = {
        title: eventTitle,
        description: eventDescription,
        date: eventDate.toDateString(),
      };

      if (eventToEdit) {
        // Edit the existing event
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.date === eventToEdit.date && event.title === eventToEdit.title
              ? { ...event, ...newEvent }
              : event
          )
        );
        Alert.alert('Event Updated', `Event updated for ${eventDate.toLocaleDateString()}`);
      } else {
        // Create a new event
        setEvents((prevEvents) => [...prevEvents, newEvent]);
        Alert.alert('Event Created', `Event created for ${eventDate.toLocaleDateString()}`);
      }
      
      setSelectedDayEvents(getEventsForDate(eventDate)); // Update events for selected day
      closeEventModal();
    } else {
      Alert.alert('Error', 'Please fill in both the title and description.');
    }
  };

  const deleteEvent = () => {
    if (eventToEdit) {
      Alert.alert(
        'Delete Event',
        `Are you sure you want to delete the event "${eventToEdit.title}"?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            onPress: () => {
              // Remove the event from the events array
              setEvents((prevEvents) =>
                prevEvents.filter((event) => event !== eventToEdit)
              );
              setSelectedDayEvents(getEventsForDate(selectedDate));
              Alert.alert('Event Deleted', `Event "${eventToEdit.title}" has been deleted.`);
              closeEventModal();
            },
          },
        ]
      );
    }
  };

  const generateMonthlyCalendarWithPadding = (currentDate) => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const startPaddingDays = firstDayOfMonth.getDay();
    const endPaddingDays = 6 - lastDayOfMonth.getDay();

    const days = Array.from({ length: lastDayOfMonth.getDate() }, (_, i) => ({
      day: i + 1,
      dateObject: new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1),
    }));

    return [
      ...Array.from({ length: startPaddingDays }, () => ({ day: null, dateObject: null })),
      ...days,
      ...Array.from({ length: endPaddingDays }, () => ({ day: null, dateObject: null })),
    ];
  };

  const goToPreviousMonth = () => {
    setCurrentDate((prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate((prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1));
  };

  const getEventsForDate = (date) => {
    return events.filter(event => event.date === date.toDateString());
  };

  return (
    <View style={styles.calendarContainer}>
      {/* Weekly View */}
      <View style={styles.weeklyViewContainer}>
        <FlatList
          horizontal={true}
          data={currentWeek}
          keyExtractor={(item) => item.dateObject.toISOString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleDayPress(item)}
              style={[styles.dayBox, item.isToday && styles.todayBox, selectedDate.toDateString() === item.dateObject.toDateString() && styles.selectedBox]}
            >
              <Text style={styles.dayOfWeek}>
                {item.dateObject && item.dateObject.toLocaleDateString('en-US', { weekday: 'short' })}
              </Text>
              <Text style={styles.dateText}>{item.day}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Toggle Button */}
      <TouchableOpacity
        style={[styles.iconButton, { position: 'absolute', top: 80, left: screenWidth / 2.3, zIndex: 100 }]}
        onPress={toggleCalendar}
      >
        <Ionicons
          name={isFullCalendarVisible ? 'calendar-outline' : 'calendar-sharp'}
          size={28}
          color="#043927"
        />
      </TouchableOpacity>

      {/* Animated Dropdown */}
      <Animated.View
        style={[styles.fullCalendarContainer, { maxHeight: animationHeight, overflow: 'hidden' }]}
      >
        <View style={styles.fullCalendarHeaderContainer}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.arrowButton}>
            <Ionicons name="chevron-back" size={24} color="#043927" />
          </TouchableOpacity>
          <Text style={styles.fullCalendarHeader}>
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.arrowButton}>
            <Ionicons name="chevron-forward" size={24} color="#E4CFA3" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={generateMonthlyCalendarWithPadding(currentDate)}
          numColumns={7}
          keyExtractor={(item, index) => `${item.dateObject || 'empty'}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={item.dateObject ? () => handleDayPress(item) : null}
              style={[
                styles.monthDayBox,
                item.dateObject && item.dateObject.toDateString() === new Date().toDateString() && styles.todayBox,
                item.dateObject && selectedDate.toDateString() === item.dateObject.toDateString() && styles.selectedBox,
              ]}
            >
              <Text style={styles.dateText}>{item.dateObject ? item.day : ''}</Text>
              {/* Show event info if any */}
              {item.dateObject && getEventsForDate(item.dateObject).length > 0 && (
                <View style={styles.eventIndicator}>
                  <Text style={styles.eventText}>�</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      </Animated.View>

      {/* Event Creation/Editing Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeEventModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{eventToEdit ? 'Edit Event' : 'Create Event'}</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Event Title"
              placeholderTextColor='grey'
              value={eventTitle}
              onChangeText={setEventTitle}
            />
            <TextInput
              style={styles.inputField}
              placeholder="Event Description"
              placeholderTextColor='grey'
              value={eventDescription}
              onChangeText={setEventDescription}
            />
            <Button title={eventToEdit ? 'Save Changes' : 'Save Event'} onPress={saveEvent} />
            {eventToEdit && (
              <Button title="Delete Event" onPress={deleteEvent} color="red" />
            )}
            <Button title="Cancel" onPress={closeEventModal} />
          </View>
        </View>
      </Modal>

      {/* Display events for the selected day */}
      {selectedDayEvents.length > 0 && (
        <View style={styles.eventListContainer}>
          <Text style={styles.eventListTitle}>Events for {selectedDate.toLocaleDateString()}:</Text>
          <FlatList
            data={selectedDayEvents}
            keyExtractor={(item, index) => `${item.date}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.eventItem}
                onPress={() => openEventModal(selectedDate, item)} // Open modal for editing
              >
                <View style={styles.eventItemContent}>
                  <Text style={styles.eventItemTitle}>{item.title}</Text>
                  <Text style={styles.eventItemDescription}>{item.description}</Text>
                  <Text style={styles.eventItemDate}>{item.date}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default CalendarComponent;
