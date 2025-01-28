import { StyleSheet } from 'react-native';
import * as colors from '../SacStateColors/GeneralColors';

const styles = StyleSheet.create({
  dashboardContainer: {
    flex: 1,
    backgroundColor: colors.offWhite, // Subtle light green-gray background for the whole dashboard
  },
  scrollViewContainer: {
    flexGrow: 1,
    paddingBottom: 20,
    backgroundColor: colors.offWhite, // Matches the overall background
  },
  goldBackground: {
    backgroundColor: colors.mutedGold, // Subtle muted gold for content sections
    padding: 20,
    borderRadius: 15,
    flex: 1,
    alignSelf: 'stretch',
    marginHorizontal: 15,
    marginVertical: 10,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  calendarSection: {
    backgroundColor: colors.whiteSmoke,
    borderRadius: 15,
    padding: 15,
    marginVertical: 15,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  servicesHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.sacGreen,
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
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
    elevation: 3, // Android shadow
    alignSelf: 'center', // Center the button on the screen
    width: '90%', // Set a width relative to the container (matches chatToggle)
    maxWidth: 450, // Limit the maximum width to match the chatbot toggle
  },
  buttonText: {
    color: colors.sacGreen,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  servicesContainer: {
    padding: 15,
    backgroundColor: colors.white, // Clean white for services section
    borderRadius: 15,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginHorizontal: 15,
    marginVertical: 10,
  },
  serviceBox: {
    backgroundColor: colors.whiteGreen,
    padding: 15,
    marginVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  serviceText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.sacGreen,
    textAlign: 'center',
  },
  chatWidget: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.sacGreen,
    padding: 15,
    borderRadius: 25,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  chatWidgetIcon: {
    color: colors.goldenWhite,
    fontSize: 20,
  },
  eventCard: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.sacGreen,
  },
  eventTime: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 5,
  },
  noEventsText: {
    color: colors.gray,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  currentDayContainer: {
    backgroundColor: colors.sacGreen,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    padding: 25,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  currentDayText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.mutedGold,
    marginTop: 10,
  },
  expandButton: {
    marginTop: 15,
    backgroundColor: 'transparent', // Transparent button background
    borderWidth: 2,
    borderColor: colors.mutedGold,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  expandButtonText: {
    color: colors.mutedGold,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default styles;

