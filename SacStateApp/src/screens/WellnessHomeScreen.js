import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import styles from '../HomeStyles/HomeStyles'; //new

const WellnessHome = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text>Go to wellness questions</Text>
       <Button
        title="Go to Wellness Questions"
        onPress={() => navigation.navigate('WellnessScreen')}
      />
    </View>
    
    
  );
};

export default WellnessHome;
