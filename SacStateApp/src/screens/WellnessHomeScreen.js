import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, Animated, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../WellnessStyles/WellnessHomeStyles'; // Ensure this import is correct

const { width: screenWidth } = Dimensions.get('window'); // Get screen width

const WellnessHome = ({ navigation }) => {
  const [score, setScore] = useState(0);
  const maxScore = 25; // Maximum Score
  const healthBarAnim = useRef(new Animated.Value(0)).current; // Animated value for health bar width
  const [containerWidth, setContainerWidth] = useState(0); // Width of the health bar container

  // Function to determine the health bar color based on the score
  const getHealthBarColor = (score) => {
    const colorRanges = [
      { min: 5, max: 10, color: 'red' },
      { min: 11, max: 15, color: 'orange' },
      { min: 16, max: 20, color: 'yellow' },
      { min: 21, max: 25, color: 'green' },
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
  }, []);

  const healthBarWidth = (score / maxScore) * containerWidth; // Calculate the width in pixels

  useEffect(() => {
    console.log("Score:", score, "Health Bar Width (px):", healthBarWidth); // Debugging
    Animated.timing(healthBarAnim, {
      toValue: healthBarWidth, // Target width in pixels
      duration: 500, // Animation duration in milliseconds
      useNativeDriver: false, // Must be false for layout properties
    }).start();
  }, [score, containerWidth]); // Trigger animation when score or container width changes

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>Wellness Check-in Health Score</Text>
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
      </View>
      <Text>{score} / {maxScore}</Text>
      <Button
        title="Check on your Wellness"
        onPress={() => navigation.navigate('WellnessScreen')}
      />
    </View>
  );
};

export default WellnessHome;
