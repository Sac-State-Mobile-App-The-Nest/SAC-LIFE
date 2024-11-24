import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  dashboardContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Subtle light green-gray background for the whole dashboard
  },
  scrollViewContainer: {
    flexGrow: 1,
    paddingBottom: 20,
    backgroundColor: '#F8F9FA', // Matches the overall background
  },
  goldBackground: {
    backgroundColor: '#E4CFA3', // Subtle muted gold for content sections
    padding: 20,
    borderRadius: 15,
    flex: 1,
    alignSelf: 'stretch',
    marginHorizontal: 15,
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  calendarSection: {
    backgroundColor: '#F5F5F5', // Subtle gray to contrast from the main background
    borderRadius: 15,
    padding: 15,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  servicesHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#043927', // Sac State green
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBF8EF', // Faded Sac State gold
    borderColor: '#E4CFA3', // Muted gold border
    padding: 15,
    borderRadius: 30,
    shadowColor: '#000', // Slight shadow for a floating effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3, // Android shadow
    alignSelf: 'center', // Center the button on the screen
    width: '90%', // Set a width relative to the container (matches chatToggle)
    maxWidth: 450, // Limit the maximum width to match the chatbot toggle
  },
  buttonText: {
    color: '#043927', // Sac State green for the text
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  servicesContainer: {
    padding: 15,
    backgroundColor: '#FFFFFF', // Clean white for services section
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginHorizontal: 15,
    marginVertical: 10,
  },
  serviceBox: {
    backgroundColor: '#E8F4EA', // Soft green for service items
    padding: 15,
    marginVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  serviceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#043927', // Strong green for text
    textAlign: 'center',
  },
  chatWidget: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#043927', // Sac State green
    padding: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  chatWidgetIcon: {
    color: '#F5F1DF', // Off-white text for the chat widget
    fontSize: 20,
  },
  eventCard: {
    backgroundColor: '#FFFFFF', // Clean white for events
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#043927', // Strong green for event titles
  },
  eventTime: {
    fontSize: 14,
    color: '#6C757D', // Subtle gray for event times
    marginTop: 5,
  },
  noEventsText: {
    color: '#6C757D', // Subtle gray for the "no events" message
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  currentDayContainer: {
    backgroundColor: '#043927', // Deep Sac State green
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  currentDayText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E4CFA3', // Subtle muted gold for current day text
    marginTop: 10,
  },
  expandButton: {
    marginTop: 15,
    backgroundColor: 'transparent', // Transparent button background
    borderWidth: 2,
    borderColor: '#E4CFA3', // Muted gold border
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  expandButtonText: {
    color: '#E4CFA3', // Muted gold for text
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default styles;

