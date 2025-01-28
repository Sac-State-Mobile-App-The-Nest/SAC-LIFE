import { StyleSheet, Dimensions } from 'react-native';
import * as colors from '../SacStateColors/GeneralColors';

const { width: screenWidth } = Dimensions.get('window');
const tileMargin = 4; // Adjusted margin for smaller tiles
const tileSize = Math.floor((screenWidth - tileMargin * 14) / 7); // Dynamically calculate smaller tile size for 7 columns

const styles = StyleSheet.create({
  calendarContainer: {
    marginTop: 10,
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
    padding: 25,
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
    fontSize: 28,
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
    fontSize: 16,
    textAlign: 'center',
  },
  fullCalendarContainer: {
    marginTop: 20,
    borderRadius: 15,
    maxHeight: 500, // Prevent overflowing on smaller screens
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
    width: 50,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.mutedGold,
    backgroundColor: 'transparent', // Remove white backgrounds here
  },
  monthDayBox: {
    width: tileSize * 0.9, // Smaller width for the tile
    height: tileSize * 0.9, // Smaller height for the tile
    alignItems: 'center',
    justifyContent: 'center',
    margin: tileMargin,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.mutedGold,
  },
  todayBox: {
    borderColor: colors.mutedGold,
    borderWidth: 2,
    backgroundColor: colors.bubbles,
  },
  selectedBox: {
    backgroundColor: colors.bubbles,
    borderColor: colors.mutedGold,
    borderWidth: 2,
  },
  dayOfWeek: {
    fontSize: 12, // Smaller font size for day names
    fontWeight: '600',
    color: colors.sacGreen,
    textAlign: 'center',
  },
  dateText: {
    fontSize: tileSize * 0.3, // Smaller responsive font size
    fontWeight: 'bold',
    color: colors.sacGreen,
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
  eventsContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
    backgroundColor: colors.white,
    borderRadius: 15,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
    padding: 15,
    marginVertical: 5,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.sacGreen,
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
    marginTop: 15,
    padding: 10,
    borderRadius: 50, // Retain circular padding for clickability
    backgroundColor: 'transparent', // Transparent background
    elevation: 0, // No elevation
    shadowColor: 'transparent', // Remove shadow
    shadowOffset: { width: 0, height: 0 }, // No offset
    shadowOpacity: 0, // No opacity
    shadowRadius: 0, // No blur
  },
  topRightIcon: {
    position: 'absolute', // Places the icon absolutely on the screen
    top: 10, // Distance from the top of the container
    right: 10, // Distance from the right of the container
    zIndex: 10, // Ensures it appears above other elements
  },
  centeredYearText: {
    fontSize: 28, // Larger font size for the year
    fontWeight: 'bold',
    color: colors.mutedGold,
    textAlign: 'center',
    marginTop: 5, // Add a small gap above the year
  },
  weeklyViewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', // Even spacing between days
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: colors.whiteSmokeLight,
    borderRadius: 15,
    marginBottom: 10,
  },
  monthlyRow: {
    justifyContent: 'space-between', // Ensure spacing between tiles
    marginVertical: 5,
  },
  fullCalendarHeaderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
  },
  fullCalendarHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.sacGreen,
    textAlign: 'center',
  },
});


export default styles;
