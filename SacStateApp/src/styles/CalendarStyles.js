import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  calendarContainer: {
    marginTop: 10,
    backgroundColor: '#F8F9FA', // Muted light gray for subtle contrast
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    color: '#E4CFA3', // Subtle muted gold
    marginTop: 10,
  },
  expandButton: {
    marginTop: 15,
    backgroundColor: '#FBF8EF', // Faded Sac State gold for button
    borderWidth: 2, // Gold outline
    borderColor: '#E4CFA3', // Sac State gold
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    alignSelf: 'center', // Centers the button
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  expandButtonText: {
    color: '#043927', // Deep green for text
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  fullCalendarContainer: {
    marginTop: 20,
    backgroundColor: '#FFFFFF', // Clean white
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventsContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    color: '#043927', // Strong green for headers
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: '#FBF8EF', // Faded Sac State gold
    borderRadius: 12,
    borderWidth: 2, // Gold outline
    borderColor: '#E4CFA3', // Sac State gold
    padding: 15,
    marginBottom: 10,
    alignItems: 'center', // Center the text
    justifyContent: 'center',
    elevation: 0, // No shadow for simplicity
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#043927', // Sac State green
    textAlign: 'center',
  },
  eventTime: {
    fontSize: 14,
    color: '#6C757D', // Neutral gray
    marginTop: 5,
    textAlign: 'center',
  },
  noEventsText: {
    color: '#6C757D', // Subtle gray
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  dayBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF', // Clean white for unselected days
    borderWidth: 1,
    borderColor: '#E4CFA3', // Subtle gold for day borders
  },
  todayBox: {
    borderColor: '#E4CFA3', // Muted gold
    borderWidth: 2,
    backgroundColor: '#E9F4EC', // Light green for today
  },
  selectedBox: {
    backgroundColor: '#043927', // Sac State green
    borderColor: '#E4CFA3', // Subtle gold for selected day
    borderWidth: 2,
  },
  dayOfWeek: {
    fontSize: 14,
    fontWeight: '600',
    color: '#043927', // Green for day names
    textAlign: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#043927', // Green for numbers
    textAlign: 'center',
  },
  toggleButton: {
    alignSelf: 'center',
    marginTop: 15,
    backgroundColor: '#043927', // Sac State green
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  toggleButtonText: {
    color: '#E4CFA3', // Muted gold for text
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default styles;

