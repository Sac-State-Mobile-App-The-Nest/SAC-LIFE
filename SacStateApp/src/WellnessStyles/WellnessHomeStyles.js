import { StyleSheet, Dimensions } from 'react-native';
import * as colors from '../SacStateColors/GeneralColors';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    // Background image styles
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    backgroundImageStyle: {
        opacity: 0.5,
        resizeMode: 'cover',
    },

    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    container: {
        width: '90%',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent white
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        marginVertical: 20, // Added vertical spacing
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
        height: 30,
        backgroundColor: '#E0E0E0',
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 10,
        position: 'relative',
        borderWidth: 2,
        borderColor: '#A0A0A0',
    },
    healthBar: {
        height: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)'
    },
    percentageContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    percentageText: {
        color: '#000000',
        fontSize: 14,
        fontWeight: 'bold',
        textShadowColor: 'rgba(255,255,255,0.5)',
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