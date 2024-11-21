import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import styles from '../styles/DashboardStyles';

const WellBeingButton = ({ prompt }) => {
  const handlePress = () => {
    Alert.alert('Well-Being Check', prompt);
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Text style={{ color: 'white' }}>Check In on Well-Being</Text>
    </TouchableOpacity>
  );
};

export default WellBeingButton;

