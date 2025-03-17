import React, { useState, useEffect, useRef } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { sendStudentCreatedEvent } from '../DashboardAPI/api';
import { Ionicons } from '@expo/vector-icons';
import styles from '../DashboardStyles/CalendarStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { View, FlatList, TouchableOpacity, Text, Animated, Dimensions, Modal, TextInput, Button, Alert, ScrollView, Platform, Linking } from 'react-native';
import * as filter from 'leo-profanity';

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
  const [sacStateEvents, setSacStateEvents] = useState([]); //stores all of the sac state events -> fills with api call
  const [studentEvents, setStudentEvents] = useState([]); //stores all of the student created events
  const [expandedEvent, setExpandedEvent] = useState(null); //whether the event tile is expanded to show description or not

  const [eventStartTime, setEventStartTime] = useState(new Date());
  const [eventEndTime, setEventEndTime] = useState(new Date());
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTimePicker, setSelectedTimePicker] = useState(new Date());
  const [isStartDate, setIsStartDate] = useState(null); // Used for modal (time picker): checking if the button on the left is pressed

  const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
  const fullCalendarHeight = screenHeight * 0.5; // Dropdown height is half the screen
  filter.loadDictionary();

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
    setCurrentDate(new Date());
    getAllSacStateEvents();
    getAllStudentCreatedEvents();
    setCurrentWeek(week);
  }, []);
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentDate(new Date());
  //   }, 1000); // Update every second
  
  //   return () => clearInterval(interval); // Cleanup when the component unmounts
  // }, []);
  
  // watches for changes in events and makes sure the events show right when app is loaded
  useEffect(() => {
    if (sacStateEvents.length > 0 || studentEvents.length > 0) {
      const todayEvents = [
        ...getSacStateEventsForDate(selectedDate),
        ...getStudentCreatedEventsForDate(selectedDate),
      ];
      setSelectedDayEvents(todayEvents);
    }
  }, [sacStateEvents, studentEvents, selectedDate,]);

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
    // console.log(day);
    console.log(currentDate);
    // Check if it's a double-click
    if (currentTime - lastClickTime < 500) { // Double-click within 500ms
      openEventModal(day); // Open event creation modal
    } else {
      setSelectedDate(day.dateObject);
      const campusEvents = getSacStateEventsForDate(day.dateObject); //sac state events
      const userEvents = getStudentCreatedEventsForDate(day.dateObject); //user created events
      setSelectedDayEvents([...userEvents, ...campusEvents]); // Get events for the tapped day - user and campus events
    }

    setLastClickTime(currentTime); // Update last click time
  };

  const isDateEqual = (date1, date2) => {
    return (date1.getDate() == date2.getDate() && date1.getMonth() == date2.getMonth());
  }

  const openEventModal = (day, event = null) => {
    setEventDate(day.dateObject); // Set the date for the event
    
    if (event) {
      // If editing an existing event, pre-fill the modal with the event data
      setEventToEdit(event); // Store the event to be edited
      setEventTitle(event.title);
      setEventDescription(event.description);
    } else {
      console.log("ELSE STATEMENT");
      // console.log(day.dateObject.getDate() == currentDate.getDate() && day.dateObject.getMonth() == currentDate.getMonth());
      // console.log(Number(day.dateObject) == Number(currentDate));
      // Clear fields for creating a new event
      setEventToEdit(null);
      setEventTitle('');
      setEventDescription('');
      // setting starting calendar date for creating new event
      if(isDateEqual(day.dateObject, currentDate)){
        setEventStartTime(() => {
          const newDate = new Date(currentDate);
          newDate.setHours(currentDate.getHours() + 1);
          newDate.setMinutes(0);
          newDate.setSeconds(0);
          console.log(newDate);
          return newDate;
        });
        setEventEndTime(() => {
          const newDate = new Date(currentDate);
          newDate.setHours(currentDate.getHours() + 2);
          newDate.setMinutes(0);
          newDate.setSeconds(0);
          console.log(newDate);
          return newDate;
        });
      }else{
        setEventStartTime(() => {
          const newDate = new Date(day.dateObject);
          newDate.setHours(8);
          newDate.setMinutes(0);
          newDate.setSeconds(0);
          console.log(newDate);
          return newDate;
        });
        setEventEndTime(() => {
          const newDate = new Date(day.dateObject);
          newDate.setHours(9);
          newDate.setMinutes(0);
          newDate.setSeconds(0);
          console.log(newDate);
          return newDate;
        });
      }
      console.log("current: ", currentDate);
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

  //gets a list of all sac state events (event_id, event_title, event_description, event_type, event_link, event_date)
  const getAllSacStateEvents = async () => {
    try{
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`http://${process.env.DEV_BACKEND_SERVER_IP}:5000/api/events/getAllCampusEvents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSacStateEvents(response.data);
    } catch(err){
      console.error("Unable to get all Sac State Events");
    }
  };
  //get a list of sac state events just for the day when clicked on calendar
  const getSacStateEventsForDate = (date) => {
    return sacStateEvents.filter(event => {
      const eventDate = new Date(event.event_start_date);
  
      // Normalize both eventDate and the date to be compared to, and only use year, month, and day
      const eventDateString = eventDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const selectedDateString = date.toISOString().split('T')[0];  // Format: YYYY-MM-DD
  
      return eventDateString === selectedDateString;
    });
  };

  //gets a list of all user created events for that user (event_id, event_title, event_description, event_date)
  const getAllStudentCreatedEvents = async () => {
    try{
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`http://${process.env.DEV_BACKEND_SERVER_IP}:5000/api/events/getAllStudentEvents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStudentEvents(response.data);
    } catch(err){
      console.error("Unable to get all Sac State Events");
    }
  };
  const getStudentCreatedEventsForDate = (date) => {
    return studentEvents.filter(event => {
      const eventDate = new Date(event.event_start_date);
  
      // Normalize both eventDate and the date to be compared to, and only use year, month, and day
      const eventDateString = eventDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const selectedDateString = date.toISOString().split('T')[0];  // Format: YYYY-MM-DD
  
      return eventDateString === selectedDateString;
    });
  };

  const saveEvent = () => {
    if (eventTitle.trim() && eventDescription.trim()) {

      //title and description length filtering
      if (eventTitle.length > 30){
        Alert.alert('Title Too Long', 'Event title must be less than or equal to 30 characters.');
        return;
      }
      if (eventDescription.length > 100){
        Alert.alert('Description Too Long', 'Event description must be less than or eqaul to 100 characters');
        return;
      }

      //bad word filtering
      if (filter.check(eventTitle)) {
        Alert.alert('Inappropriate Title', 'Let\'s be friendly');
        return;
      }
      if (filter.check(eventDescription)) {
        Alert.alert('Inappropriate Description', 'Let\'s be friendly');
        return;
      }

      const newEvent = {
        title: eventTitle,
        description: eventDescription,
        event_start_date: eventStartTime.toISOString().split('T')[0] + " " + eventStartTime.toLocaleTimeString([], {hour:'2-digit', minute: '2-digit', second: '2-digit',hour12: false}),
        event_end_date: eventEndTime.toISOString().split('T')[0] + " " + eventEndTime.toLocaleTimeString([], {hour:'2-digit', minute: '2-digit', second: '2-digit',hour12: false})
      };
      console.log(newEvent);
      if (eventToEdit) {
        // Edit the existing event
        setStudentEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.date === eventToEdit.date && event.title === eventToEdit.title
              ? { ...event, ...newEvent }
              : event
          )
        );
        Alert.alert('Event Updated', `Event updated for ${eventDate.toLocaleDateString()}`);
      } else {
        // // Add the new event locally first
        // setStudentEvents((prevEvents) => [...prevEvents, newEvent]);
        // setSelectedDayEvents((prevEvents) => [...prevEvents, newEvent]); // Update events for selected day immediately
  
        
        // sendStudentCreatedEvent(newEvent); // Send to server
        
  
        Alert.alert('Event Created', `Event created for ${eventDate.toLocaleDateString()}`);
      }
  
      closeEventModal();
      
      // Fetch latest events from the backend after updating state
      // getAllStudentCreatedEvents();
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

  //when a tile is clicked, it'll set whether it has been expanded or not
  const toggleExpand = (event) => {
    setExpandedEvent(expandedEvent === event ? null : event);
  };

  return (
    <View style={styles.calendarContainer}>

      {/* Toggle Button */}
      <TouchableOpacity
        style={[styles.iconButton]}
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
              {/* {item.dateObject && getEventsForDate(item.dateObject).length > 0 && (
                <View style={styles.eventIndicator}>
                  <Text style={styles.eventText}>�</Text>
                </View>
              )} */}
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
              placeholder="Title: Max 30 characters"
              placeholderTextColor='grey'
              value={eventTitle}
              onChangeText={setEventTitle}
            />
            <TextInput
              style={styles.inputField}
              placeholder="Description: Max 100 characters"
              placeholderTextColor='grey'
              value={eventDescription}
              onChangeText={setEventDescription}
            />

            {/* Calendar Picker Button */}
            <View style={styles.modalTimeSelector}>
              {/* START DATE BUTTON */}
              <TouchableOpacity onPress={() => {
                setShowCalendarPicker(true);
                setIsStartDate(true);
                setSelectedTimePicker(eventStartTime);
                }} style={{ padding: 10, backgroundColor: '#ddd', marginBottom: 10 }}>
                <Text>{eventStartTime.toDateString()}</Text>
              </TouchableOpacity>
              {/* END DATE BUTTON */}
              <TouchableOpacity onPress={() => {
                setShowCalendarPicker(true);
                setIsStartDate(false);
                setSelectedTimePicker(eventEndTime);
                }} style={{ padding: 10, backgroundColor: '#ddd', marginBottom: 10 }}>
                <Text>{eventEndTime.toDateString()}</Text>
              </TouchableOpacity>
            </View>

            {/* Time Picker Button */}
            <View style={styles.modalTimeSelector}>
              {/* START DATE BUTTON */}
              <TouchableOpacity onPress={() => {
                setShowTimePicker(true);
                setIsStartDate(true);
                setSelectedTimePicker(eventStartTime);
                }} style={{ padding: 10, backgroundColor: '#ddd', marginBottom: 10 }}>
                <Text>{eventStartTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</Text>
              </TouchableOpacity>
              {/* END DATE BUTTON */}
              <TouchableOpacity onPress={() => {
                setShowTimePicker(true);
                setIsStartDate(false);
                setSelectedTimePicker(eventEndTime);
                }} style={{ padding: 10, backgroundColor: '#ddd', marginBottom: 10 }}>
                <Text>{eventEndTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</Text>
              </TouchableOpacity>
            </View>

            {/* Calendar Picker Modal */}
            {showCalendarPicker && (
              <DateTimePicker
                value={selectedTimePicker}
                display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                onChange={(event, selectedDate) => {
                  setShowCalendarPicker(false);
                  if (selectedDate && isStartDate) {
                    if (selectedDate > eventEndTime){
                      setEventStartTime((prevDate) => {
                        const newDate = new Date(prevDate);
                        newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                        eventEndTime.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                        return newDate;
                      });
                    }else{
                      setEventStartTime(selectedDate);
                    }
                  } else if (selectedDate && !isStartDate) {
                    if (selectedDate < eventStartTime){
                      setEventEndTime((prevDate) => {
                        const newDate = new Date(prevDate);
                        newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                        eventStartTime.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                        return newDate;
                      });
                    }else{
                      setEventEndTime(selectedDate)
                    }
                  }
                }}
              />
            )}

            {/* Time Picker Modal */}
            {showTimePicker && (
              <DateTimePicker
                value={selectedTimePicker}
                mode = "time"
                display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  //
                  if (selectedTime && isStartDate) {
                    if(selectedTime.getTime() > eventEndTime.getTime()){
                      setEventStartTime((prevDate) => {
                        const newDate = new Date(prevDate);
                        newDate.setHours(selectedTime.getHours());
                        newDate.setMinutes(selectedTime.getMinutes());
                        eventEndTime.setHours(selectedTime.getHours());
                        eventEndTime.setMinutes(selectedTime.getMinutes());
                        return newDate;
                      });
                    }else{
                      setEventStartTime((prevDate) => {
                        const newDate = new Date(prevDate);
                        newDate.setHours(selectedTime.getHours());
                        newDate.setMinutes(selectedTime.getMinutes());
                        return newDate;
                      });
                    }
                  } else if (selectedTime && !isStartDate) {
                    if(selectedTime.getTime() < eventStartTime.getTime()){
                      setEventEndTime((prevDate) => {
                        const newDate = new Date(prevDate);
                        newDate.setHours(selectedTime.getHours());
                        newDate.setMinutes(selectedTime.getMinutes());
                        eventStartTime.setHours(selectedTime.getHours());
                        eventStartTime.setMinutes(selectedTime.getMinutes());
                        return newDate;
                      });
                    }else{
                      setEventEndTime((prevDate) => {
                        const newDate = new Date(prevDate);
                        newDate.setHours(selectedTime.getHours());
                        newDate.setMinutes(selectedTime.getMinutes());
                        return newDate;
                      });
                    }
                  }
                }}
              />)
            }

            <Button title={eventToEdit ? 'Save Changes' : 'Save Event'} onPress={saveEvent} />
            {eventToEdit && (
              <Button title="Delete Event" onPress={deleteEvent} color="red" />
            )}
            <Button title="Cancel" onPress={closeEventModal} />
          </View>
        </View>
      </Modal>


      <Text style={styles.eventsHeader}>Your Events</Text>
      <View style={styles.eventsContainer}>
        {selectedDayEvents.length > 0 ? (
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={{ paddingBottom: 10 }}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {selectedDayEvents.map((event, index) => (
              <TouchableOpacity key={index} onPress={() => toggleExpand(event)} style={styles.eventCard}>
                <Text style={styles.eventTitle}>{event.event_title}</Text>
                <Text style={styles.eventTime}>
                  {new Date(event.date || event.event_start_date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} -
                  {new Date(event.date || event.event_end_date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </Text>
                <Text style={styles.eventTime}>
                  {new Date(event.date || event.event_start_date).toDateString()} -
                  {new Date(event.date || event.event_end_date).toDateString()}
                </Text>
                {expandedEvent === event && (
                  <View style={styles.expandedContent}>
                    <Text style={styles.eventDescription}>{event.event_description || "No description available."}</Text>
                    {event.event_link && (
                      <TouchableOpacity onPress={() => Linking.openURL(event.event_link)}>
                        <Text style={styles.eventLink}>Open Event Link</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noEventsText}>No events for this day</Text>
        )}
      </View>
    </View>
  );
};

export default CalendarComponent;
