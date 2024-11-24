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
        title="Go to Profile Creation"
        onPress={() => navigation.navigate('ProfileCreation')}
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

const stylesC = StyleSheet.create({
  chatWidgetContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000, // Ensures it stays on top of other elements
  },
});

export default Dashboard;
