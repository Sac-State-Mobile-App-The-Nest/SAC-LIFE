import { StyleSheet } from 'react-native';
import * as colors from '../SacStateColors/GeneralColors';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 30,
        justifyContent: 'center',
        alignItems: 'center',
      },
      title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#043927',
        marginBottom: 10,
        textAlign: 'center',
      },
      button: {
        backgroundColor: '#043927',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginBottom: 15,
        width: '100%',
      },
      buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
      },
});



export default styles;
