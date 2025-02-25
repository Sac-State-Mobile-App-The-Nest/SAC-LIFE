import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import styles from '../DashboardStyles/ServicesStyles';

const ServicesList = ({ services }) => {

  //Randomize the services and show only 3 at a time, after clicking "Search Your Services, it'll navigate to all of your services page"
  const [displayedServices, setDisplayedServices] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    if (services.length > 0) {
      shuffleAndSetServices();
    }
  }, [services]);

  const shuffleAndSetServices = () => {
    const shuffled = [...services].sort(() => Math.random() - 0.5);
    setDisplayedServices(shuffled.slice(0, 3));
  };

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
        <Text style={styles.details}>
          Want to explore services? Update your preferences anytime!
        </Text>
      ) : (
        displayedServices.map((service, index) => (
          <TouchableOpacity
            key={index}
            style={styles.serviceBox}
            onPress={() => handlePress(service.service_link)}
          >
            <Text style={styles.serviceTitle}>{service.serv_name}</Text>
          </TouchableOpacity>
        ))
      )}
      {services.length > 3 && (
        <TouchableOpacity
          style={styles.serviceBoxShowMore}
          onPress={() => navigation.navigate('AllServices', { services })}
        >
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={24} style={styles.searchIcon} />
            <Text style={styles.serviceTitleShowMore}>Search Your Services</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ServicesList;
