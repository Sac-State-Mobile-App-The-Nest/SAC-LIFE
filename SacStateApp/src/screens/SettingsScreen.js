// screens/SettingsScreen.js

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import styles from '../SettingsStyles/SettingsStyles'; //new

const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings Screen</Text>
    </View>
  );
};

export default SettingsScreen;