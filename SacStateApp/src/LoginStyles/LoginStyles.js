import { StyleSheet } from 'react-native';
import * as colors from '../SacStateColors/GeneralColors';

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
        backgroundColor: colors.darkOverlay,
        width: '100%',
        padding: 16,
    },
    title: {
        fontSize: 32, // Slightly larger for more presence
        fontWeight: '900', // Extra bold for impact
        marginBottom: 6, // Better spacing
        color: colors.mutedGold,
        textAlign: 'center',
        textTransform: 'uppercase', // Professional look
        letterSpacing: 1.5, // Adds spacing for a refined feel
        fontFamily: 'serif', // A more distinct font style (try other fonts if needed)
        textShadowColor: colors.black, // Stronger contrast
        textShadowOffset: { width: 2, height: 2 }, // Deeper shadow for depth
        textShadowRadius: 4,
    },
    
    subTitle: {
        fontSize: 16, // Subtle yet readable
        fontWeight: '500', // Slightly bolder
        fontStyle: 'italic', // Adds some elegance
        color: colors.mutedGold, // Softer for contrast
        textAlign: 'center',
        marginBottom: 22, // More spacing below
        letterSpacing: 1, // More refined look
        fontFamily: 'sans-serif-light', // Smooth, modern font
        textShadowColor: colors.black,
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 3,
    },
    box: {
        backgroundColor: colors.mutedDarkGreen, //colors.mutedDarkGreen
        borderRadius: 20, // Modern rounded edges
        padding: 25,
        width: '90%',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15, // Softer shadow
        shadowRadius: 6,
        elevation: 6,
        alignItems: 'center',
        borderColor: colors.subtleFadedGold,
        borderWidth: 1.5,
    },
    input: {
        height: 45,
        borderColor: colors.fadedGold,
        borderWidth: 1.5,
        marginBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: colors.opaqueWhite,
        borderRadius: 8,
        width: '100%',
        fontSize: 16,
        color: colors.sacGreen,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: colors.opaqueWhite,
        borderRadius: 8,
        borderColor: colors.fadedGold,
        borderWidth: 1.5,
        paddingHorizontal: 15,
    },
    passwordInput: {
        flex: 1, // Makes the input field take up remaining space
        height: 45,
        fontSize: 16,
        color: colors.sacGreen,
    },
    eyeIcon: {
        padding: 10,
    },
    error: {
        color: colors.brightRed, // Bright red for visibility
        marginBottom: 12,
        fontSize: 14,
        textAlign: 'center',
    },
    button: {
        backgroundColor: colors.mutedSacStateGreen,
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignItems: 'center',
        width: '60%',
        marginTop: 10,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
        borderColor: colors.subtleFadedGold,
        borderWidth: 1.5,
    },
    buttonText: {
        color: colors.softCream,
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
        backgroundColor: colors.fadedGold,
    },
    skipButtonText: {
        color: colors.sacGreen,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default styles;