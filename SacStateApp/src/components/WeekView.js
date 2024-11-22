import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/CalendarStyles';

const WeekView = ({ selectedDate, setSelectedDate }) => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const today = new Date();
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    return {
      day: date.getDate(),
      dateString: date.toISOString().split('T')[0],
      isToday: date.toDateString() === new Date().toDateString(),
    };
  });

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  return (
    <View style={styles.weekViewContainer}>
      {week.map((item) => (
        <TouchableOpacity
          key={item.dateString}
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
      ))}
    </View>
  );
};

export default WeekView;
