import { StyleSheet, Dimensions } from 'react-native';
import * as colors from '../SacStateColors/GeneralColors';

const { height } = Dimensions.get('window') || { height: 800 };

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: colors.offWhite, // Neutral background
        position: 'relative', // Required for overlay elements
    },
    logoImage: {
        opacity: 0.5, // Adjust brightness (lower opacity makes it less bright)
        resizeMode: 'cover', // Ensure the logo covers the screen proportionally
    },
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    gradientBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.subtleGreen,
        opacity: 0.5,
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'transparent', // Maintain transparency over gradient
    },
    heading: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.sacGreen,
        marginBottom: 15,
        textAlign: 'center',
    },
    box: {
        backgroundColor: colors.white,
        borderRadius: 15,
        padding: 20,
        width: '90%', // Matches proportions of other screens
        minHeight: height * 0.2,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        marginVertical: 10,
        borderColor: colors.mutedGold,
        borderWidth: 1,
    },
    questionText: {
        fontSize: 20,
        color: colors.sacGreen,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 20,
    },
    optionButton: {
        padding: 15,
        backgroundColor: colors.fadedSacGold,
        borderRadius: 12,
        width: '90%',
        alignItems: 'center',
        marginVertical: 5,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        borderColor: colors.mutedGold,
        borderWidth: 1,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.sacGreen,
        textAlign: 'center',
    },
    input: {
        padding: 12,
        borderWidth: 1,
        borderColor: colors.sacGreen,
        borderRadius: 8,
        backgroundColor: colors.white,
        marginBottom: 10,
        width: '90%',
        alignSelf: 'center',
    },
    pickerContainer: {
        width: '90%',
        backgroundColor: colors.fadedSacGold, // Faded gold for dropdown
        borderRadius: 12,
        borderColor: colors.mutedGold,
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 12,
    },
    pickerText: {
        color: colors.sacGreen,
        fontSize: 16,
        textAlign: 'center',
    },
    navigationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        width: '90%',
        alignSelf: 'center',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: colors.fadedSacGold, // Faded gold background for buttons
        borderRadius: 15,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        borderColor: colors.mutedGold,
        borderWidth: 1,
    },
    buttonText: {
        color: colors.sacGreen,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    completionContainer: {
        alignItems: 'center',
        padding: 30,
    },
    completionText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.sacGreen,
        marginBottom: 25,
        textAlign: 'center',
    },
    largeButton: {
        padding: 15,
        backgroundColor: colors.fadedSacGold, // Match multiple-choice button styling
        borderRadius: 12,
        width: '90%',
        alignItems: 'center',
        marginVertical: 10,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        borderColor: colors.mutedGold,
        borderWidth: 1,
    },
    largeButtonText: {
        color: colors.sacGreen,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
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
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    selectedOptionButton: {
        backgroundColor: '#4CAF50', 
        borderColor: '#4CAF50', // 
    },
    selectedOptionText: {
        color: '#FFFFFF', 
    },
    selectedDropdownText: {
        marginTop: 10,
        fontSize: 16,
        color: '#4CAF50', 
        fontWeight: 'bold',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    pickerContainer: {
        marginBottom: 10,
    },
    pickerText: {
        fontSize: 16,
        color: 'black',
    },
    selectedDropdownText: {
        marginTop: 10,
        fontSize: 16,
        color: 'green',
    },
});

export default styles;
