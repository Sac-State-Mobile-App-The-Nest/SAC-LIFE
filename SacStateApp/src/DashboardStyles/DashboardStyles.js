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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingVertical: 35, // Increased padding for better spacing
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden', 
    position: 'relative',
  },
  currentDayText: {
    fontSize: 28, 
    fontWeight: 'bold',
    color: colors.mutedGold,
    textAlign: 'center',
    letterSpacing: 1, 
    lineHeight: 34, 
    flexWrap: 'nowrap', 
    maxWidth: '90%', 
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  headerIcon: {
    marginBottom: 10, // Space between icon and text
  },
  
});

export default styles;

