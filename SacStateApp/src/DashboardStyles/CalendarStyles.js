import { StyleSheet, Dimensions } from 'react-native';
import * as colors from '../SacStateColors/GeneralColors';

const { width: screenWidth } = Dimensions.get('window');
const tileMargin = 4; // Adjusted margin for smaller tiles
const tileSize = Math.floor((screenWidth - tileMargin * 14) / 7); // Dynamically calculate smaller tile size for 7 columns

const styles = StyleSheet.create({
  calendarContainer: {
    marginTop: 1,
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
 currentDayContainer: {
    backgroundColor: colors.sacGreen, // Deep Sac State green as a fallback
    borderBottomLeftRadius: 50, // Increased curve for a smoother edge
    borderBottomRightRadius: 50, // Increased curve for a smoother edge
    padding: 15,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6, // For Android shadow
    overflow: 'hidden', // Ensure the gradient respects container bounds
    position: 'relative',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  currentDayText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.mutedGold,
    marginTop: 10,
  },
  expandButtonWeekly: {
    alignSelf: 'center',
    marginTop: 15,
    backgroundColor: colors.fadedSacGold,
    padding: 10,
    borderRadius: 50, // Circular button for the icon
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  expandButtonTextWeekly: {
    color: colors.sacGreen,
    fontWeight: 'bold',
    fontSize: 1,
    textAlign: 'center',
  },
  fullCalendarContainer: {
    marginTop: 20,
    borderRadius: 2,
    maxHeight: 1000, // Prevent overflowing on smaller screens
    overflow: 'hidden', // Clip content within bounds
  },
  fullCalendarHeader: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: colors.sacGreen,
    textAlign: 'center',
  },
  dayBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    paddingVertical: 5, // Reduce extra padding
    backgroundColor: 'transparent', // No background
    borderWidth: 0, // Remove border
    shadowColor: 'transparent', // Remove shadow
  },
  monthDayBox: {
    width: tileSize * 0.85, // Adjusted for better proportion
    height: tileSize * 0.85, 
    alignItems: 'center',
    justifyContent: 'center',
    margin: tileMargin,
    borderRadius: 8, // Slightly rounded corners
    backgroundColor: colors.softCream, 
    borderWidth: 1.2, 
    borderColor: colors.mutedGold, 
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1.5,
  },
  todayBox: {
    backgroundColor: colors.fadedSacGold, // Softer gold, less aggressive
    borderColor: colors.sacGreen, // Retain the green contrast
    borderWidth: 2, // Less overwhelming border
    shadowColor: colors.sacGreen,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3, // Keep subtle elevation for modern design
  },
  selectedBox: {
    backgroundColor: colors.softCream, // Neutral selection
    borderColor: colors.sacGreen,
    borderWidth: 2, 
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dayOfWeek: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.sacGreen, 
    textAlign: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black, 
    textAlign: 'center',
  },
  toggleButton: {
    alignSelf: 'center',
    marginTop: 15,
    backgroundColor: colors.sacGreen,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  toggleButtonText: {
    color: colors.mutedGold,
    fontWeight: 'bold',
    fontSize: 16,
  },
  eventsHeader: {
    marginTop: 14,
    marginLeft: 15,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.sacGreen,
  },
  eventsContainer: {
    maxHeight: 300,
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 10,
    backgroundColor: colors.white,
  },
  scrollContainer: {
    maxHeight: 280,  
    flexGrow: 1,  
  },
  sectionTitle: {
    color: colors.sacGreen,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10,
  },
  eventCard: {
    backgroundColor: colors.fadedSacGold,
    borderRadius: 12,
    borderWidth: 1, // Subtle border
    borderColor: colors.mutedGold,
    padding: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.sacGreen,
  },
  expandedEventTile: {
    backgroundColor: colors.sacGreen,
  },
  eventDescription: {
    fontSize: 15,
    color: colors.smokeGray,
  },
  eventLink: {
    fontSize: 14,
    color: colors.subtleGreen,
    textDecorationLine: 'underline',
    marginTop: 5,
  },
  eventTime: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 3,
  },
  noEventsText: {
    color: colors.gray,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  iconButton: {
    alignSelf: 'center',
    position: 'absolute',
    top: 5,  // Reduce this value (was 60 or 80) to move it up
    left: screenWidth / 2.3,
    zIndex: 100,
    padding: 10,
    borderRadius: 50,
    backgroundColor: 'transparent',
  },
  weeklyViewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', // Ensures even spacing
    alignItems: 'center',
    paddingVertical: 8,  // Reduce padding for a cleaner look
    paddingHorizontal: 5,
    backgroundColor: 'transparent', // Remove the green background
  },
  currentDayDot: {
    width: 6,  // Small dot size
    height: 6,
    borderRadius: 3, // Circular shape
    backgroundColor: colors.sacGreen, // Sac State Green color
    alignSelf: 'center', // Ensures centering within the container
    marginTop: 2, // Slightly adjust the spacing to center under the number
  },
  monthlyRow: {
    justifyContent: 'space-between', // Ensure spacing between tiles
    marginVertical: 5,
  },
  fullCalendarHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5, // Increase spacing from the toggle button
    marginBottom: 0,
  },
  fullCalendarHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.sacGreen,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center', // Centers content horizontally
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
    color: 'black', // Keeping title text color black
    textAlign: 'center', // Ensure the title is centered
  },
  inputField: {
    width: '100%',
    padding: 10,
    color: 'black',
    marginVertical: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    textAlign: 'left', // Keep text aligned to the left inside the input field
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#043927', // Button background color (green for example)
    borderRadius: 5,
    width: '100%',
    alignItems: 'center', // Center the button text
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Event list container style
  eventListContainer: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginTop: 10,
  },

  // Title of the event list section
  eventListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#043927',
    marginBottom: 10,
  },

  // Individual event styling
  eventItem: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#043927', // Highlight with a left border
  },

  // Event item content container
  eventItemContent: {
    paddingLeft: 10,
    paddingRight: 10,
  },

  // Event title styling
  eventItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#043927',
    marginBottom: 5,
  },

  // Event description styling
  eventItemDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },

  // Event date styling
  eventItemDate: {
    fontSize: 12,
    color: '#777',
    fontStyle: 'italic',
  }
  });


export default styles;
