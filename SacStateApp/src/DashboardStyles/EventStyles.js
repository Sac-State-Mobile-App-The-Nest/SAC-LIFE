import { StyleSheet } from 'react-native';
import * as colors from '../SacStateColors/GeneralColors';

const styles = StyleSheet.create({
  eventTab: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  eventDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.sacGreen,
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.sacGreen,
  },
  eventDescription: {
    fontSize: 16,
    color: colors.gray,
    marginTop: 10,
  },
});

export default styles;
