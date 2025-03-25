import { StyleSheet, Dimensions } from 'react-native';
import * as colors from '../SacStateColors/GeneralColors'; // Import colors if needed

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    // added for image background testing
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },

    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5', // Light gray background for the entire screen
    },
    container: {
        width: '90%',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFFFFF', // White background for the content container
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.sacGreen,
        textAlign: 'center',
        marginBottom: 10,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 30,
    },
    healthScoreContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 30,
    },
    healthScoreText: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.sacGreen,
        marginBottom: 10,
    },
    healthBarContainer: {
        width: '100%',
        height: 30, // Height of the health bar container
        backgroundColor: '#E0E0E0', // Background color for the empty part of the bar
        borderRadius: 15, // Rounded corners
        overflow: 'hidden', // Ensures the inner bar stays within bounds
        marginBottom: 10,
        position: 'relative', // Needed for absolute positioning of percentage text
    },
    healthBar: {
        height: '100%', // Fill the container height
        // Removed justifyContent and alignItems as text is now outside
    },
    percentageContainer: {
        position: 'absolute', // Absolute positioning within healthBarContainer
        width: '100%', // Span entire width of container
        height: '100%', // Span entire height of container
        justifyContent: 'center', // Center vertically
        alignItems: 'center', // Center horizontally
    },
    percentageText: {
        color: '#000000', // Changed to black for better visibility on all bar colors
        fontSize: 14,
        fontWeight: 'bold',
        textShadowColor: 'rgba(255,255,255,0.5)', // Optional: adds slight white shadow for better contrast
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    primaryButton: {
        width: '100%',
        backgroundColor: colors.sacGreen,
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 15,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    secondaryButton: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        paddingVertical: 15,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: colors.sacGreen,
        alignItems: 'center',
        marginBottom: 30,
    },
    secondaryButtonText: {
        color: colors.sacGreen,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default styles;