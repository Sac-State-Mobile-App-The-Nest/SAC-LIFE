import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WellnessScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Wellness Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // White background
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#043927', // Sac State green
  },
});

export default WellnessScreen;
