import { StyleSheet } from 'react-native';
import * as colors from '../SacStateColors/WellnessColors'; //new

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cleanWhite, // White background
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.sacGreen, // Sac State green
  },
});

export default styles;