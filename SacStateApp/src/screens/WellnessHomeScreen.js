import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, ScrollView, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../WellnessStyles/WellnessHomeStyles'; // Ensure this import is correct

const { width: screenWidth } = Dimensions.get('window'); // Get screen width
const SAC_STATE_LOGO = require('../assets/sac-state-logo.png'); //added for image background testing

const WellnessHome = ({ navigation }) => {
  const [score, setScore] = useState(0);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const maxScore = 25; // Maximum Score
  const healthBarAnim = useRef(new Animated.Value(0)).current; // Animated value for health bar width
  const [containerWidth, setContainerWidth] = useState(0); // Width of the health bar container

  // Array of welcome messages
  const welcomeMessages = [
    "Welcome back! How are you feeling today?",
    "Hello! Ready to check on your wellness?",
    "Hi there! Let's see how you're doing.",
    "Good to see you! How's your wellness today?",
    "Welcome! Time for a quick wellness check.",
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

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const storedAnswers = await AsyncStorage.getItem('wellnessAnswers');
        if (storedAnswers) {
          const answers = JSON.parse(storedAnswers);
          const totalScore = Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0); // Ensure values are numbers
          setScore(totalScore);
        }
      } catch (error) {
        console.error('Failed to fetch answers: ', error);
      }
    };
    fetchAnswers();

    // Set a random welcome message
    const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    setWelcomeMessage(randomMessage);
  }, []);

  const healthBarWidth = (score / maxScore) * containerWidth; // Calculate the width in pixels
  const percentage = ((score / maxScore) * 100).toFixed(0); // Calculate the percentage

  useEffect(() => {
    console.log("Score:", score, "Health Bar Width (px):", healthBarWidth); // Debugging
    Animated.timing(healthBarAnim, {
      toValue: healthBarWidth, // Target width in pixels
      duration: 500, // Animation duration in milliseconds
      useNativeDriver: false, // Must be false for layout properties
    }).start();
  }, [score, containerWidth]); // Trigger animation when score or container width changes

  // image background currently ruins the page format, uncomment to see.
  return (
    //<ImageBackground source={backgroundImage} style={styles.backgroundImage}>
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Welcome to Your Wellness Journey Text */}
        <Text style={styles.welcomeTitle}>Welcome to Your Wellness Journey</Text>
        <Text style={styles.welcomeSubtitle}>You're not alone. Let's check in on your well-being today.</Text>

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
            >
              <Text style={styles.percentageText}>{percentage}%</Text>
            </Animated.View>
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
 //</ImageBackground>
  );
};

export default WellnessHome;