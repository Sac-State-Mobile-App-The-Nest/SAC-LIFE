// styles/SettingsStyles.js
import { StyleSheet } from 'react-native';
import * as colors from '../SacStateColors/GeneralColors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fadedWhiteSmoke,
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.white,
    marginTop: 20,
    marginHorizontal: 15,
    borderRadius: 12,
  },
  profileIcon: {
    marginRight: 15,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
  },
  profileEmail: {
    fontSize: 14,
    color: colors.gray,
  },
  sectionHeader: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.smokeGray,
    textTransform: 'uppercase',
  },
  sectionContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginHorizontal: 15,
    paddingVertical: 5,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.smokeWhite,
  },
  itemText: {
    fontSize: 16,
    marginLeft: 15,
    color: colors.darkGray,
  },
  iconColor: {
    color: colors.sacGreen, //icon color
  },
});

export default styles;
