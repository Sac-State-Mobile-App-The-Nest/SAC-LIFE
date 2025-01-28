import { StyleSheet } from 'react-native';
import * as colors from '../SacStateColors/GeneralColors';

const styles = StyleSheet.create({
  serviceContainer: {
    padding: 20,
  },
  servicesHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.sacGreen,
  },
  details: {
    fontSize: 16,
    color: colors.gray,
  },
  serviceBox: {
    backgroundColor: colors.whiteGold,
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.sacGreen,
    textAlign: 'center',
  },
});

export default styles;
