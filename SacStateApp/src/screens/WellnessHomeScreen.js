import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { ProgressBar } from 'react-native-paper'; // Import ProgressBar
import styles from '../WellnessStyles/WellnessHomeStyles'; //new

const WellnessHome = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text>Go to wellness questions</Text>
      
        {/* Progress Bar with 45% completion */}
        <ProgressBar progress={0.45} color="green" style={styles.progressBar} />
      
       <Button
        title="Go to Wellness Questions"
        onPress={() => navigation.navigate('WellnessScreen')}
      />
    </View>
    
    
  );
};

export default WellnessHome;
