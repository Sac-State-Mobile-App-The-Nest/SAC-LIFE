import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Slightly darker overlay for better readability
        width: '100%',
        padding: 16,
    },
    title: {
        fontSize: 28, // Prominent but not overpowering
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#E4CFA3', // Faded gold for a warmer, softer tone
        textShadowColor: 'rgba(0, 0, 0, 0.6)', // Slightly darker shadow for contrast
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        textAlign: 'center',
    },
    subTitle: {
        fontSize: 16, // Subtle yet readable
        fontWeight: '400',
        color: '#E4CFA3', // Muted gold for harmony
        textShadowColor: 'rgba(0, 0, 0, 0.4)', // Soft shadow for readability
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        marginBottom: 20,
        textAlign: 'center',
    },
    box: {
        backgroundColor: 'rgba(43, 58, 50, 0.8)', // Muted dark green with transparency
        borderRadius: 20, // Modern rounded edges
        padding: 25,
        width: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15, // Softer shadow
        shadowRadius: 6,
        elevation: 6,
        alignItems: 'center',
        borderColor: 'rgba(251, 248, 239, 0.5)', // Subtle faded gold border for elegance
        borderWidth: 1.5,
    },
    input: {
        height: 45,
        borderColor: 'rgba(251, 248, 239, 0.8)', // Faded gold for harmony
        borderWidth: 1.5,
        marginBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slightly more opaque white
        borderRadius: 8,
        width: '100%',
        fontSize: 16,
        color: '#043927', // Dark green for better readability
    },
    togglePasswordButton: {
        backgroundColor: 'rgba(4, 57, 39, 0.8)', // Muted Sac State green
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
        width: '100%',
    },
    togglePasswordText: {
        color: '#FDF6E4', // Soft cream for harmony
        fontSize: 16,
        fontWeight: '600',
    },
    error: {
        color: '#ff4d4d', // Bright red for visibility
        marginBottom: 12,
        fontSize: 14,
        textAlign: 'center',
    },
    button: {
        backgroundColor: 'rgba(4, 57, 39, 0.9)', // Muted dark green
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
        borderColor: 'rgba(251, 248, 239, 0.5)', // Subtle faded gold border
        borderWidth: 1.5,
    },
    buttonText: {
        color: '#FDF6E4', // Soft cream text for better harmony
        fontSize: 18,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    skipButton: {
        position: 'absolute', // Keeps it in the top-right corner
        top: 50,
        right: 20,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
        backgroundColor: 'rgba(251, 248, 239, 0.8)', // Faded gold for subtle presence
    },
    skipButtonText: {
        color: '#043927', // Dark green text for contrast
        fontSize: 16,
        fontWeight: '600',
    },
});

export default styles;