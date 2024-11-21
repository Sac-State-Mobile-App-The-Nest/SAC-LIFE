import React, { useState, useEffect } from 'react';
import { ScrollView, View, ImageBackground } from 'react-native';
import CalendarComponent from './CalendarComponent';
import EventTab from './EventTab';
import ServicesList from './ServicesList';
import WellBeingButton from './WellBeingButton';
import HeaderLogo from './HeaderLogo';
import ChatWidget from './ChatWidget';
import { fetchUserServices } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/DashboardStyles';
import backgroundImage from '../assets/logInBackground.jpg';

const DashboardTab = () => {
  const [userServicesRec, setUserServicesRec] = useState([]);
  const [wellBeingPrompt, setWellBeingPrompt] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [event, setEvent] = useState(null);
  const [isEventTabVisible, setEventTabVisible] = useState(false);
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
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

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.goldBackground}>
          <HeaderLogo />
          <CalendarComponent
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            setEvent={setEvent}
            setEventTabVisible={setEventTabVisible}
            markedDates={markedDates}
            setMarkedDates={setMarkedDates}
          />
          {isEventTabVisible && <EventTab event={event} selectedDate={selectedDate} closeTab={() => setEventTabVisible(false)} />}
          <ServicesList services={userServicesRec} />
          <WellBeingButton prompt={wellBeingPrompt} />
          <ChatWidget />
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default DashboardTab;
