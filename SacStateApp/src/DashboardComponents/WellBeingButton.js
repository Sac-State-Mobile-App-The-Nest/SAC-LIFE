import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import styles from '../DashboardStyles/DashboardStyles';

const WellBeingButton = ({ prompt }) => {
  const handlePress = () => {
    Alert.alert('Well-Being Reminder', prompt);
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Text style={styles.buttonText}>How Are You Feeling Today?</Text>
    </TouchableOpacity>
  );
};

export default WellBeingButton;

