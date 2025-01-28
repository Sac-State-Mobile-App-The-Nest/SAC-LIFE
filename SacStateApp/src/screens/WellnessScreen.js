import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import styles from '../WellnessStyles/WellnessStyles'; //new

const WellnessScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Wellness Screen</Text>
    </View>
  );
};

export default WellnessScreen;
