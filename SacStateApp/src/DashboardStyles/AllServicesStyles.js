import { StyleSheet, Dimensions } from 'react-native';
const { height, width } = Dimensions.get('window');
import * as colors from '../SacStateColors/GeneralColors';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.whiteSmoke,
        paddingTop: 50, // Ensures space for the back button
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: height * 0.05, // Push header down to prevent overlap
        marginBottom: 15,
        color: colors.sacGreen,
    },
    backButton: {
        position: 'absolute',
        top: height * 0.08, // 5% from the top of the screen
        left: width * .08,
        zIndex: 10,
        padding: 10,
    },
    searchInput: {
        backgroundColor: colors.smokeWhite,
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        marginHorizontal: 20,
        marginBottom: 15,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    serviceBox: {
        width: width * .45,
        backgroundColor: colors.whiteGold,
        alignSelf: "center",
        borderRadius: 8,
        padding: 10,
        marginVertical: 10,
        elevation: 3,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    serviceItem: {
        flexDirection: 'row',  // Arrange number and name in a row
        alignItems: 'center',  // Align items vertically
    },
    serviceTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.sacGreen,
        flex: 1,
        textAlign: 'left',
    },
});

export default styles;