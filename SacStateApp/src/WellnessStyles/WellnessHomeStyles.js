import { StyleSheet, Dimensions } from 'react-native';
import * as colors from '../SacStateColors/GeneralColors'; // Import colors if needed
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -550,
        padding: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    healthBarContainer: {
        width: '80%',
        height: 20,
        backgroundColor: '#e0e0e0', // Light gray background for the health bar container
        borderRadius: 10,
        overflow: 'hidden',
        marginVertical: 10,
    },
    healthBar: {
        height: '100%',
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
    questionText: {
        fontSize: 22,
        fontWeight: '600',
        color: colors.sacGreen,
        textAlign: 'center',
        marginTop: 20,
        lineheight: 28,
    },
});

export default styles;