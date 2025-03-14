import { StyleSheet, Dimensions } from 'react-native';
import * as colors from '../SacStateColors/GeneralColors';
const { width, height } = Dimensions.get('window'); // ✅ Ensure `width` is included

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: colors.offWhite, 
        position: 'relative', 
    },
    logoImage: {
        opacity: 0.4, // Subtle logo effect
        resizeMode: 'cover',
    },
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingBottom: 30,
        backgroundColor: 'transparent',
    },
    heading: {
        fontSize: 30, // Increased font size for emphasis
        fontWeight: 'bold',
        color: colors.sacGreen,
        marginBottom: 18,
        textAlign: 'center',
        letterSpacing: 1, // Slightly increased spacing for a sleek look
        textTransform: 'uppercase', // Gives it a refined style
        textShadowColor: 'rgba(0, 0, 0, 0.15)', // Subtle shadow for depth
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
        borderBottomWidth: 2, // Underline effect
        borderBottomColor: colors.mutedGold,
        paddingBottom: 6,
    },
    box: {
        backgroundColor: colors.white,
        borderRadius: 18,
        padding: 24,
        width: '92%', 
        minHeight: height * 0.25,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
        marginVertical: 12,
        borderColor: colors.mutedGold,
        borderWidth: 1.2,
    },
    questionText: {
        fontSize: 22,
        fontWeight: '600',
        color: colors.sacGreen,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 28,
    },
    optionButton: {
        paddingVertical: 16,
        paddingHorizontal: 10,
        backgroundColor: colors.fadedSacGold,
        borderRadius: 14,
        width: '95%',
        alignItems: 'center',
        marginVertical: 7,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderColor: colors.mutedGold,
        borderWidth: 1,
    },
    optionText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: colors.sacGreen,
        textAlign: 'center',
    },
    inputContainer: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 12,
    },
    input: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderWidth: 1.2,
        borderColor: colors.sacGreen,
        borderRadius: 10,
        backgroundColor: colors.white,
        marginBottom: 12,
        width: '92%',
        fontSize: 16,
        alignSelf: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 3,
        elevation: 2,
    },
    pickerContainer: {
        width: '92%',
        backgroundColor: colors.fadedSacGold, 
        borderRadius: 14,
        borderColor: colors.mutedGold,
        borderWidth: 1.2,
        paddingHorizontal: 12,
        paddingVertical: 14,
    },
    pickerText: {
        color: colors.sacGreen,
        fontSize: 17,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    navigationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between', 
        marginTop: 25,
        width: '92%',
        alignSelf: 'center',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        backgroundColor: colors.fadedSacGold, 
        borderRadius: 18,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 5,
        elevation: 4,
        borderColor: colors.mutedGold,
        borderWidth: 1.2,
    },
    buttonText: {
        color: colors.sacGreen,
        fontSize: 17,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    completionContainer: {
        alignItems: 'center',
        padding: 35,
    },
    completionText: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.sacGreen,
        marginBottom: 25,
        textAlign: 'center',
        lineHeight: 32,
    },
    largeButton: {
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: colors.fadedSacGold, 
        borderRadius: 14,
        width: '92%',
        alignItems: 'center',
        marginVertical: 12,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 5,
        elevation: 4,
        borderColor: colors.mutedGold,
        borderWidth: 1.2,
    },
    largeButtonText: {
        color: colors.sacGreen,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    footerDecoration: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 60,
        backgroundColor: colors.fadedSacGold,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
    },
    selectedOptionButton: {
        backgroundColor: '#4CAF50', 
        borderColor: '#4CAF50', 
    },
    selectedOptionText: {
        color: '#FFFFFF', 
    },
    selectedDropdownText: {
        marginTop: 12,
        fontSize: 17,
        color: '#4CAF50', 
        fontWeight: 'bold',
    },
    checkboxContainer: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 12,
    },
    selectAllText: {
        fontStyle: 'italic',
        fontSize: 15, 
        color: '#666', 
        marginBottom: 12, 
    },
    // Base styles for animations
    fadeInInitial: {
        opacity: 0, 
    },
    fadeInActive: {
        opacity: 1, 
    },
    slideInInitial: {
        transform: [{ translateX: -100 }], 
    },
    slideInActive: {
        transform: [{ translateX: 0 }], 
    },

    
    tutorialContainer: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingBottom: 30,
        width: '100%', // Ensures proper alignment
    },
    tutorialImage: {
        width: width * 3,  // Makes it larger, but still responsive
        height: undefined,  // Allows height to be determined by aspect ratio
        aspectRatio: 16 / 9,  // Adjust this based on your image dimensions
        resizeMode: 'contain', // Ensures no stretching
        marginVertical: height * 0.02, // Dynamic margin for different screens
        alignSelf: 'center',
    },
    tutorialTitle: {
        fontSize: 28, 
        fontWeight: 'bold',
        color: colors.sacGreen,
        textAlign: 'center',
        marginBottom: 20,
    },
    tutorialText: {
        fontSize: 18, 
        color: colors.darkGray, 
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 10,
    },
});

export default styles;
