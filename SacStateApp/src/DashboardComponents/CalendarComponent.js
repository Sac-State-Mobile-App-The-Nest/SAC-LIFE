import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, TouchableOpacity, Text, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../DashboardStyles/CalendarStyles';

const CalendarComponent = ({ selectedDate, setSelectedDate }) => {
  const [currentWeek, setCurrentWeek] = useState([]);
  const [isFullCalendarVisible, setFullCalendarVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date()); // Initialize to today's date
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
    setSelectedDate(day.dateObject);
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

  return (
    <View style={styles.calendarContainer}>
      {/* Weekly View */}
      <View style={styles.weeklyViewContainer}>
        <FlatList
          horizontal
          data={currentWeek}
          keyExtractor={(item) => item.dateObject.toISOString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleDayPress(item)}
              style={[
                styles.dayBox,
                item.isToday && styles.todayBox,
                selectedDate.toDateString() === item.dateObject.toDateString() && styles.selectedBox,
              ]}
            >
              <Text style={styles.dayOfWeek}>
                {item.dateObject &&
                  item.dateObject.toLocaleDateString('en-US', { weekday: 'short' })}
              </Text>
              <Text style={styles.dateText}>{item.day}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Toggle Button */}
      <TouchableOpacity
        style={[
          styles.iconButton,
          {
            position: 'absolute',
            top: 80,
            left: screenWidth / 2.3,
            zIndex: 100,
          },
        ]}
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
        style={[
          styles.fullCalendarContainer,
          {
            maxHeight: animationHeight,
            overflow: 'hidden',
          },
        ]}
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
                item.dateObject &&
                  item.dateObject.toDateString() === new Date().toDateString() &&
                  styles.todayBox,
                item.dateObject &&
                  selectedDate.toDateString() === item.dateObject.toDateString() &&
                  styles.selectedBox,
              ]}
            >
              <Text style={styles.dateText}>{item.dateObject ? item.day : ''}</Text>
            </TouchableOpacity>
          )}
        />
      </Animated.View>
    </View>
  );
};

export default CalendarComponent;
