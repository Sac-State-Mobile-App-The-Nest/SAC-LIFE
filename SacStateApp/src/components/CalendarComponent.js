import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import styles from '../styles/CalendarStyles';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarComponent = ({ selectedDate, setSelectedDate }) => {
  const [currentWeek, setCurrentWeek] = useState([]);
  const [isFullCalendarVisible, setFullCalendarVisible] = useState(false);

  useEffect(() => {
    // Generate the current week dynamically
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())); // Start of the week (Sunday)
    const week = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return {
        day: date.getDate(),
        dateString: date.toISOString().split('T')[0],
        isToday: date.toDateString() === new Date().toDateString(),
      };
    });
    setCurrentWeek(week);
  }, []);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  return (
    <View style={styles.calendarContainer}>
      {!isFullCalendarVisible ? (
        <FlatList
          horizontal
          data={currentWeek}
          keyExtractor={(item) => item.dateString}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleDayPress(item)}
              style={[
                styles.dayBox,
                item.isToday && styles.todayBox,
                selectedDate === item.dateString && styles.selectedBox,
              ]}
            >
              <Text style={styles.dayOfWeek}>{daysOfWeek[new Date(item.dateString).getDay()]}</Text>
              <Text style={styles.dateText}>{item.day}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View>
          <Text style={styles.fullCalendarHeader}>November 2024</Text>
          <FlatList
            data={currentWeek}
            numColumns={7}
            keyExtractor={(item) => item.dateString}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleDayPress(item)}
                style={[
                  styles.fullCalendarDayBox,
                  item.isToday && styles.todayBox,
                  selectedDate === item.dateString && styles.selectedBox,
                ]}
              >
                <Text style={styles.dateText}>{item.day}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setFullCalendarVisible(!isFullCalendarVisible)}
      >
        <Text style={styles.toggleButtonText}>
          {isFullCalendarVisible ? 'Show Week View' : 'Expand to Full Calendar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CalendarComponent;
