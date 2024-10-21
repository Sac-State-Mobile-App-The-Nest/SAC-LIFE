// screens/Dashboard.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const Dashboard = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text>Sac State Life</Text>
      <Button
        title="Go to Dashboard"
        onPress={() => navigation.navigate('Dashboard')}
      />
      <Button
        title="Go to Log In"
        onPress={() => navigation.navigate('LogIn')}
      />
       <Button
        title="Go to Questionnaire"
        onPress={() => navigation.navigate('Questionnaire')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Dashboard;
