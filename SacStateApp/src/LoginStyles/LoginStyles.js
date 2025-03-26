import { StyleSheet } from 'react-native';
import * as colors from '../SacStateColors/GeneralColors';

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        resizeMode: 'cover', // Ensures the background image scales properly on all screen sizes
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: `${colors.darkOverlay}CC`, // Dark overlay with transparency for better contrast
        width: '100%',
        padding: 20,
    },
    title: {
        fontSize: 40, // Larger size for better impact
        fontWeight: '900', // Extra bold for emphasis
        marginBottom: 20, // Increased spacing for better visual hierarchy
        color: colors.mutedGold, // Stronger, more distinct color for high contrast
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 3, // Refined letter spacing for modern design
        fontFamily: 'serif', // Classic serif font for a bold feel
        textShadowColor: colors.black,
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 8, // Stronger shadow to add depth and contrast
    },

    subTitle: {
        fontSize: 18,
        fontWeight: '500',
        fontStyle: 'italic',
        color: colors.mutedGold, // Stronger color contrast against dark background
        textAlign: 'center',
        marginBottom: 40, // More space for visual separation
        letterSpacing: 1.2, // Subtle spacing for better readability
        fontFamily: 'sans-serif-light',
        textShadowColor: colors.black,
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 4,
    },

    box: {
        backgroundColor: colors.mutedDarkGreen, // Strong contrast with the background
        borderRadius: 20,
        paddingVertical: 35,
        paddingHorizontal: 30,
        width: '90%',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35, // Darker shadow for better depth and contrast
        shadowRadius: 12,
        elevation: 15, // Increased elevation for better separation
        alignItems: 'center',
        borderColor: colors.subtleFadedGold,
        borderWidth: 2, // Thicker border for stronger definition
    },

    input: {
        height: 50,
        borderColor: colors.fadedGold, // Gold border for high visibility
        borderWidth: 2, // Thicker border for stronger contrast
        marginBottom: 20,
        paddingHorizontal: 18,
        backgroundColor: colors.opaqueWhite, // Light background for good contrast with text
        borderRadius: 12,
        width: '100%',
        fontSize: 16,
        color: colors.sacGreen, // Dark text for maximum contrast
        fontFamily: 'sans-serif',
    },

    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: colors.opaqueWhite,
        borderRadius: 12,
        borderColor: colors.fadedGold,
        borderWidth: 2, // Thicker border to match input field for uniformity
        paddingHorizontal: 18,
        marginBottom: 20,
    },

    passwordInput: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: colors.sacGreen,
        fontFamily: 'sans-serif',
    },

    eyeIcon: {
        padding: 14, // Larger touch target
    },

    error: {
        color: colors.brightRed, // High-contrast red for error messages
        marginBottom: 16,
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '600',
        backgroundColor: colors.opaqueWhite, // Adding a light background to error for visibility
        borderRadius: 8, // Rounded edges for a more polished look
        paddingVertical: 8,
        paddingHorizontal: 16,
    },

    button: {
        backgroundColor: colors.mutedSacStateGreen, // Rich green for visibility
        paddingVertical: 18,
        paddingHorizontal: 35,
        borderRadius: 12,
        alignItems: 'center',
        width: '70%',
        marginTop: 20,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 15, // Higher elevation for clear focus
        borderColor: colors.subtleFadedGold,
        borderWidth: 2,
    },

    buttonText: {
        color: colors.softCream, // Soft cream color for text contrast
        fontSize: 20,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1.8,
    },

    skipButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: colors.fadedGold,
        borderColor: colors.sacGreen,
        borderWidth: 2,
    },

    skipButtonText: {
        color: colors.sacGreen,
        fontSize: 18,
        fontWeight: '600',
    },


    linkText: {
        marginTop: 15,
        color: colors.white,
        textDecorationLine: 'underline',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    
    inputFocus: {
        borderColor: colors.mutedGold, // Gold border on focus for better contrast
        backgroundColor: colors.opaqueGold, // Gold background when focused for clearer visibility
    },
});

export default styles;
