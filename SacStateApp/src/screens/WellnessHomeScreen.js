import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../HomeStyles/HomeStyles'; //new

const WellnessHome = ({ navigation }) => {
const[score, setScore] = useState(0);
const maxScore = 25 //Maximum Score

useEffect(() => {
  const fetchAnswers = async () => {
    try{
      const storedAnswers = await AsyncStorage.getItem('wellnessAnswers');
      if(storedAnswers){
        const answers = JSON.parse(storedAnswers);
        const totalScore = Object.values(answers).reduce((sum,value) => sum + value, 0);
        setScore(totalScore);
      }
    } catch(error){
      console.error('Failed to fetch answers: ', error);
    }
  };
  fetchAnswers();
}, []);

const healthBarWidth = (score/maxScore) * 100 //Calculate the width percentage

return (
  <View style={styles.container}>
    <Text>Wellness Check-in Progress</Text>
    <View style={styles.healthBarContainer}>
      <View style={[styles.healthBar, { width: `${healthBarWidth}%` }]} />
    </View>
    <Text>{score} / {maxScore}</Text>
    <Button
      title="Go to Wellness Questions"
      onPress={() => navigation.navigate('WellnessScreen')}
    />
  </View>
);
};


export default WellnessHome;
