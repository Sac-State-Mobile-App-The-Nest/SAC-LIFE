import { StyleSheet, Dimensions } from 'react-native';
import * as colors from '../SacStateColors/GeneralColors';
const { width, height } = Dimensions.get('window');

const WellnessHomeStyles = StyleSheet.create({
    healthBarContainer: {
      width: '80%',
      height: 20,
      backgroundColor: '#e0e0e0',
      borderRadius: 10,
      overflow: 'hidden',
      marginVertical: 10,
    },
    healthBar: {
      height: '100%',
      backgroundColor: '#76c7c0',
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    heading: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
  });
  
  export default WellnessHomeStyles;