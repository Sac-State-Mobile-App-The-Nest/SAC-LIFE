import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/EventStyles';

const EventTab = ({ event, selectedDate, closeTab }) => (
  <View style={styles.eventTab}>
    <Text style={styles.eventDate}>{selectedDate}</Text>
    <Text style={styles.eventTitle}>{event.title}</Text>
    <Text style={styles.eventDescription}>{event.description}</Text>
    <TouchableOpacity onPress={closeTab} style={styles.closeButton}>
      <Text style={styles.closeButtonText}>Close</Text>
    </TouchableOpacity>
  </View>
);

export default EventTab;
