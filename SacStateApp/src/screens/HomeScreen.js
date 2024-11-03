// screens/Dashboard.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import ChatWidget from '../components/ChatWidget';

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
      
      <View style={stylesC.chatWidgetContainer}>
        <ChatWidget />
      </View>
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

const stylesC = StyleSheet.create({
  chatWidgetContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000, // Ensures it stays on top of other elements
  },
});

export default Dashboard;
