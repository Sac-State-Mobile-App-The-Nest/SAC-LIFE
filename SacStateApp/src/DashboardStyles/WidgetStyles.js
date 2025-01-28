import { StyleSheet } from 'react-native';
import * as colors from '../SacStateColors/GeneralColors';

const styles = StyleSheet.create({
  chatWidgetContainer: {
    position: 'relative',
    marginHorizontal: 20,
    marginTop: 20,
  },
  chatToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.fadedSacGold,
    borderColor: colors.mutedGold,
    padding: 15,
    borderRadius: 30,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3, // For Android shadow
  },
  toggleText: {
    color: colors.sacGreen,
    fontWeight: '600',
    marginLeft: 10,
    fontSize: 16,
  },
  chatBox: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 20,
    marginTop: 10,
    width: '100%',
    maxHeight: 300,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  messages: {
    flexGrow: 1,
    maxHeight: 150,
    marginBottom: 10,
  },
  messagesContainer: {
    paddingBottom: 10,
  },
  messageContainer: {
    marginBottom: 10,
  },
  senderLabel: {
    fontSize: 12,
    color: colors.smokeGray,
    marginBottom: 2,
  },
  message: {
    backgroundColor: colors.fadedWhiteSmoke,
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
    color: colors.darkGray,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.offsetWhite,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.smokeWhite,
  },
  input: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
    fontSize: 14,
    color: colors.darkGray,
  },
  searchIcon: {
    marginLeft: 5,
  },
  sendIcon: {
    marginLeft: 5,
  },
});

export default styles;