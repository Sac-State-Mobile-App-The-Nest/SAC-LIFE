import { React, useState, useMemo } from 'react';
import { Text, TouchableOpacity, Linking, FlatList, SafeAreaView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../DashboardStyles/AllServicesStyles.js';
import { sacGreen } from '../SacStateColors/GeneralColors.js';

const AllServicesScreen = ({ route }) => {
    const navigation = useNavigation();
    const { services } = route.params;
    const [searchQuery, setSearchQuery] = useState('');

    //Sort the services alphabetically. UseMemory makes it so that the services will automatically be sorted the next time you open this page
    //but not needed anymore since it is already sorted before
    // const sortedServices = useMemo(() => {
    //     return [...services].sort((a, b) => a.serv_name.localeCompare(b.serv_name));
    // }, [services]);

    //Filter services based on search query number or name1
    const filteredServices = useMemo(() => {
        return services.filter(service => 
            service.serv_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.index.toString().includes(searchQuery)
        );
    }, [services, searchQuery]);

    const handlePress = (link) => {
        if (link && typeof link === 'string' && link.startsWith('http')) {
        Linking.openURL(link).catch((err) => console.error('Failed to open link:', err));
        } else {
        alert('Invalid link');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
        <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            accessibilityRole="button"
        >
            <Ionicons name="arrow-back" size={40} color={sacGreen}/>
        </TouchableOpacity>

        <Text style={styles.header}>Your Services</Text>

        {/* search bar lets you search for the a support service recommended to you**/}
        <TextInput
            style={styles.searchInput}
            placeholder="Type to search..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
        />

        {/* shows all of the services recommended and by search*/}
        <FlatList
            data={filteredServices}
            keyExtractor={(item, index) => (item.index ? item.index.toString() : index.toString())}
            numColumns={2}
            columnWrapperStyle={styles.row}
            renderItem={({ item }) => (
                <TouchableOpacity style={styles.serviceBox} onPress={() => handlePress(item.service_link)}>
                <Text style={styles.serviceTitle}>{item.index}. {item.serv_name}</Text>
                </TouchableOpacity>
            )}
        />
        </SafeAreaView>
    );
};

export default AllServicesScreen;