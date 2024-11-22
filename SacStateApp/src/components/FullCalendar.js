import React from 'react';
import { View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import styles from '../styles/CalendarStyles';

const FullCalendar = ({ selectedDate, setSelectedDate }) => {
  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  return (
    <View style={styles.fullCalendarContainer}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate]: { selected: true, marked: true, selectedColor: '#FFD700' },
        }}
        style={styles.calendar}
      />
    </View>
  );
};

export default FullCalendar;

