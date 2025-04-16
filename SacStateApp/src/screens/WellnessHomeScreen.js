import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, ScrollView, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../WellnessStyles/WellnessHomeStyles'; // Ensure this import is correct
import BASE_URL from '../apiConfig.js';

const { width: screenWidth } = Dimensions.get('window'); // Get screen width
const BACKGROUND_IMAGE = require('../assets/WellnessBackGround.jpg');


const WellnessHome = ({ navigation }) => {
  const [score, setScore] = useState(0);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const maxScore = 25; // Maximum Score
  const healthBarAnim = useRef(new Animated.Value(0)).current; // Animated value for health bar width
  const [containerWidth, setContainerWidth] = useState(0); // Width of the health bar container

  // Expanded array of welcome messages focused on mental wellness
  const welcomeMessages = [
    "Welcome back! How are you feeling today?",
    "Hello! Ready to check on your wellness?",
    "Hi there! Let's see how you're doing.",
    "Good to see you! How's your wellness today?",
    "Welcome! Time for a quick wellness check.",
    "Your mental health matters. How are you really doing?",
    "Checking in on yourself is an act of self-care. How are you feeling?",
    "Welcome! Let's take a moment to reflect on your wellbeing.",
    "Hello! Remember to be kind to yourself today.",
    "Your wellness journey is important. How can we support you today?",
    "Taking time for self-reflection shows strength. How are you?",
    "Welcome back! Your mental health is just as important as your physical health."
  ];

  // Function to determine the health bar color based on the score
  const getHealthBarColor = (score) => {
    const colorRanges = [
      { min: 5, max: 10, color: '#FF6B6B' }, // Red
      { min: 11, max: 15, color: '#FFD166' }, // Orange
      { min: 16, max: 20, color: '#06D6A0' }, // Green
      { min: 21, max: 25, color: '#118AB2' }, // Blue
    ];
    // Find the matching range for the score
    const matchingRange = colorRanges.find(range => score >= range.min && score <= range.max);
    // Return the matching color or a default color if no range matches
    return matchingRange ? matchingRange.color : '#76c7c0'; // Default color
  };

  // Function to get a random welcome message
  const getRandomWelcomeMessage = () => {
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    return welcomeMessages[randomIndex];
  };

  const fetchAnswers = async () => {
    try {
      // const storedData = await AsyncStorage.getItem('wellnessAnswers');
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/students/wellness-answers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const { answers, score } = data.wellnessAnswers;
        // Use stored score if available, otherwise calculate from answers
        const calculatedScore = score || Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
        setScore(calculatedScore);
      } else {
        throw new Error('Error getting data from server');
      }
    } catch (error) {
      console.error('Failed to fetch answers: ', error);
    }
  };

  useEffect(() => {
    fetchAnswers();
    const unsubscribe = navigation.addListener('focus', async () => {
      await fetchAnswers();
      setWelcomeMessage(getRandomWelcomeMessage());
    });
    setWelcomeMessage(getRandomWelcomeMessage());
    return unsubscribe;
  }, [navigation]);
  
  useEffect(() => {
    if (score > 0 && containerWidth > 0) {
      healthBarAnim.setValue(0);
      Animated.timing(healthBarAnim, {
        toValue: (score / maxScore) * containerWidth,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [score, containerWidth]);

  const percentage = Math.min(100, Math.max(0, ((score / maxScore) * 100).toFixed(0))); // Calculate the percentage (0-100)


  return (
    <ImageBackground 
    source={BACKGROUND_IMAGE} 
    style={styles.backgroundImage}
    imageStyle={styles.backgroundImageStyle}
  >
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Welcome to Your Wellness Journey Text */}
        <Text style={styles.welcomeTitle}>Welcome to Your Wellness Journey</Text>
        <Text style={styles.welcomeSubtitle}>{welcomeMessage}</Text>

        {/* Health Score Section */}
        <View style={styles.healthScoreContainer}>
          <Text style={styles.healthScoreText}>Your Health Score</Text>
          <View
            style={styles.healthBarContainer}
            onLayout={(event) => {
              const { width } = event.nativeEvent.layout;
              setContainerWidth(width); // Set the width of the health bar container
            }}
          >
            <Animated.View
              style={[
                styles.healthBar,
                { width: healthBarAnim, backgroundColor: getHealthBarColor(score) }, // Dynamic width and color
              ]}
            />
            {/* Percentage text positioned absolutely in the middle */}
            <View style={styles.percentageContainer}>
              <Text style={styles.percentageText}>{percentage}%</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('WellnessScreen')}
        >
          <Text style={styles.primaryButtonText}>Check on your Wellness</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Resources')}
        >
          <Text style={styles.secondaryButtonText}>Explore Resources</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </ImageBackground>
  );
};

export default WellnessHome;