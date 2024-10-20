// screens/LogInScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LogInScreen = () => {
    return(
        <View style={styles.container}>
            <Text>Log In Screen</Text>
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

export default LogInScreen;
