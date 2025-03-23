import { StyleSheet, Dimensions } from 'react-native';
import * as colors from '../SacStateColors/GeneralColors'; // Import colors if needed
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
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
});

export default styles;