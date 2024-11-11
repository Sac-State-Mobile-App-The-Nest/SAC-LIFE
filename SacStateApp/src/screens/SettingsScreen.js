// screens/SettingsScreen.js

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Background color
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#043927', // Sac State Green
  },
});

export default SettingsScreen;