import { StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window') || { height: 800 };

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: '#F8F9FA', // Neutral background
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
        backgroundColor: '#E4F1E7', // Subtle soft gradient green
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
        color: '#043927', // Sac State green
        marginBottom: 15,
        textAlign: 'center',
    },
    box: {
        backgroundColor: '#FFFFFF', // Clean white for sections
        borderRadius: 15,
        padding: 20,
        width: '90%', // Matches proportions of other screens
        minHeight: height * 0.2,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        marginVertical: 10,
        borderColor: '#E4CFA3', // Faded gold border
        borderWidth: 1,
    },
    questionText: {
        fontSize: 20,
        color: '#043927', // Strong green text
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 20,
    },
    optionButton: {
        padding: 15,
        backgroundColor: '#FBF8EF', // Faded gold background
        borderRadius: 12,
        width: '90%',
        alignItems: 'center',
        marginVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        borderColor: '#E4CFA3', // Muted gold border
        borderWidth: 1,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#043927', // Sac State green
        textAlign: 'center',
    },
    input: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#043927', // Strong green border
        borderRadius: 8,
        backgroundColor: '#FFFFFF', // Clean white
        marginBottom: 10,
        width: '90%',
        alignSelf: 'center',
    },
    pickerContainer: {
        width: '90%',
        backgroundColor: '#FBF8EF', // Faded gold for dropdown
        borderRadius: 12,
        borderColor: '#E4CFA3', // Muted gold border
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 12,
    },
    pickerText: {
        color: '#043927', // Strong green text
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
        backgroundColor: '#FBF8EF', // Faded gold background for buttons
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        borderColor: '#E4CFA3', // Muted gold outline
        borderWidth: 1,
    },
    buttonText: {
        color: '#043927', // Sac State green for text
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
        color: '#043927', // Strong green text
        marginBottom: 25,
        textAlign: 'center',
    },
    largeButton: {
        padding: 15,
        backgroundColor: '#FBF8EF', // Match multiple-choice button styling
        borderRadius: 12,
        width: '90%',
        alignItems: 'center',
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        borderColor: '#E4CFA3', // Muted gold border
        borderWidth: 1,
    },
    largeButtonText: {
        color: '#043927', // Sac State green for text
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    footerDecoration: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 60,
        backgroundColor: '#FBF8EF', // Faded gold for footer
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
});

export default styles;
