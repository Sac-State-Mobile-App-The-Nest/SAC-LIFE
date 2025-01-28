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
        fontSize: 28, // Prominent but not overpowering
        fontWeight: 'bold',
        marginBottom: 5,
        color: colors.mutedGold,
        textShadowColor: colors.darkerOverlay,
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        textAlign: 'center',
    },
    subTitle: {
        fontSize: 16, // Subtle yet readable
        fontWeight: '400',
        color: colors.mutedGold,
        textShadowColor: colors.softOverlay,
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        marginBottom: 20,
        textAlign: 'center',
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
    togglePasswordButton: {
        backgroundColor: colors.mutedSacStateGreen,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
        width: '100%',
    },
    togglePasswordText: {
        color: colors.softCream,
        fontSize: 16,
        fontWeight: '600',
    },
    error: {
        color: colors.brightRed, // Bright red for visibility
        marginBottom: 12,
        fontSize: 14,
        textAlign: 'center',
    },
    button: {
        backgroundColor: colors.mutedSacStateGreen,
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
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