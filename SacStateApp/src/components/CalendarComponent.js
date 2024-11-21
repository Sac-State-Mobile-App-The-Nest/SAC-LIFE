import React from 'react';
import { Calendar } from 'react-native-calendars';
import styles from '../styles/CalendarStyles';

const events = {
  '2024-11-10': { title: 'Meet with Professor Smith', description: 'Discussion on the upcoming project.' },
  '2024-11-15': { title: 'Coding Club Meeting', description: 'Join us for the weekly coding session.' },
  '2024-11-20': { title: 'Midterm Exam', description: 'Prepare for the midterm exam in your Computer Science course.' },
};

const CalendarComponent = ({ selectedDate, setSelectedDate, setEvent, setEventTabVisible, markedDates, setMarkedDates }) => {
  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    const eventForDay = events[day.dateString] || null;
    setEvent(eventForDay);
    setEventTabVisible(!!eventForDay);
    setMarkedDates({
      [day.dateString]: { selected: true, marked: true, selectedColor: 'blue' },
    });
  };

  return <Calendar onDayPress={handleDayPress} markedDates={markedDates} style={styles.calendar} />;
};

export default CalendarComponent;
