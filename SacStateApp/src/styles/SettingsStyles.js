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
  input: {
    borderWidth: 1,
    borderColor: colors.smokeGray,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.fadedGold,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
blurBackground: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
},

centeredModal: {
  width: '85%',
  backgroundColor: colors.whiteSmoke,
  padding: 20,
  borderRadius: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 5,
  alignItems: 'center',
},

modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: 15,
  color: colors.sacGreen,
},

modalCloseButton: {
  width: '50%',
  marginTop: 15,
  backgroundColor: colors.pomegranite,
  paddingVertical: 12, 
  paddingHorizontal: 25, 
  borderRadius: 12, 
  alignItems: 'center',
  justifyContent: 'center',  
  fontSize: 16, 
  textAlign: 'center',
  shadowColor: '#000', 
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 3,
},
modalButtonText: {
  color: colors.white,
  fontSize: 16,
  fontWeight: 'bold',
},
saveButton: {
  backgroundColor: colors.mutedSacStateGreen,
  paddingVertical: 12, 
  paddingHorizontal: 25,
  borderRadius: 12, 
  alignItems: 'center',
  justifyContent: 'center', 
  shadowColor: '#000',
  textAlign: 'center',
  fontSize: 16, 
  shadowOffset: { width: 0, height: 3 }, 
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 3,
},
saveButtonText: {
  color: colors.white,
  fontSize: 16, 
  fontWeight: 'bold',
},
inputPasswordContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  position: 'relative',
  marginBottom: 20,
},
inputPassword: {
  flex: 1,
  paddingVertical: 10,
  paddingLeft: 10,
  paddingRight: 40,
  borderWidth: 1,
  borderColor: 'gray',
  borderRadius: 5,
},
eyeIconContainer: {
  position: 'absolute',
  right: 10,
},
subtitle: {
  fontSize: 16,
  fontWeight: '600',
  marginBottom: 10,
  color: colors.mutedSacStateGreen,
},
teamMembers: {
  fontSize: 14,
  lineHeight: 22,
  color: colors.darkGray,
},
});

export default styles;
