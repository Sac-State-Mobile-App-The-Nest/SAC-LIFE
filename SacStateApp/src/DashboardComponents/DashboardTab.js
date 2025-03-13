import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import CalendarComponent from './CalendarComponent';
import ServicesList from './ServicesList';
import { fetchUserServices } from '../DashboardAPI/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import styles from '../DashboardStyles/CalendarStyles';
import * as colors from '../SacStateColors/GeneralColors'; // ✅ Import colors for customization


const DashboardTab = () => {
  const [userServicesRec, setUserServicesRec] = useState([]);
  const [wellBeingPrompt, setWellBeingPrompt] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFullCalendarVisible, setFullCalendarVisible] = useState(true);
  const [currentWeek, setCurrentWeek] = useState([]);

  useEffect(() => {
    const getServices = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const data = await fetchUserServices(token);
        setUserServicesRec(data);
      } catch (error) {
        console.error('Error fetching services recommendations:', error);
      }
    };

    const generateCurrentWeek = () => {
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
  };

    getServices(); // Fetch user services
    generateCurrentWeek(); // Generate the current week

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
      keyExtractor={() => 'dummy'}
      ListHeaderComponent={
        <>
          {/* Current Day Section (Header) */}
          <View style={styles.currentDayContainer}>
            <Ionicons name="school-outline" size={50} color={colors.mutedGold} style={styles.headerIcon} />

            <Text style={styles.currentDayText} numberOfLines={1}>
                {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
                })}
            </Text>

            {/* Weekly Calendar - Transparent Background */}
            <View style={[styles.weeklyViewContainer, { backgroundColor: 'transparent', paddingVertical: 10 }]}>
              {currentWeek.map((item, index) => (
                <TouchableOpacity key={index} onPress={() => handleDayPress(item)} style={{ alignItems: 'center', paddingHorizontal: 10 }}>
                  <Text style={[styles.dayOfWeek, { color: colors.mutedGold }]}>
                    {item.dateObject.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <Text style={[styles.dateText, { color: colors.mutedGold }]}>{item.day}</Text>
                  {item.isToday && <View style={[styles.currentDayDot, { backgroundColor: colors.mutedGold }]} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
          

          {/* Full Calendar Section */}
          {isFullCalendarVisible && (
            <View style={styles.fullCalendarContainer}>
              <CalendarComponent selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
            </View>
          )}
        </>
      }
      ListFooterComponent={
        <>
          {/* Services and Well-being */}
          <View style={styles.servicesContainer}>
            <ServicesList services={userServicesRec} />
          </View>
        </>
      }
      contentContainerStyle={styles.scrollViewContainer}
      nestedScrollEnabled
    />
  );
};

export default DashboardTab;

