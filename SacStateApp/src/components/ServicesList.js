import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import styles from '../styles/ServicesStyles';

const ServicesList = ({ services }) => {
  const handlePress = (link) => {
    if (link) {
      Linking.openURL(link).catch((err) =>
        console.error('Failed to open link:', err)
      );
    }
  };

  return (
    <View style={styles.serviceContainer}>
      <Text style={styles.servicesHeader}>Find Your Support</Text>
      {services.length === 0 ? (
        <Text style={styles.details}>Want to explore services? Update your preferences anytime!</Text>
      ) : (
        services.map((service, index) => (
          <TouchableOpacity
            key={index}
            style={styles.serviceBox}
            onPress={() => handlePress(service.service_link)}
          >
            <Text style={styles.serviceTitle}>{service.serv_name}</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

export default ServicesList;
