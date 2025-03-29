import { StyleSheet } from 'react-native';
import * as colors from '../SacStateColors/GeneralColors';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.whiteSmoke, // Matches the background color for a seamless look
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.whiteSmoke,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: 20, // Add padding to avoid top cutoff
  },
  goldBackground: {
    backgroundColor: colors.fadedSacGold,
    paddingVertical: 80,
    paddingHorizontal: 20,
    borderRadius: 25, // Slightly larger rounding for a modern feel
    width: '90%',
    elevation: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15, // Softer shadow for elegance
    shadowRadius: 8,
    alignItems: 'center',
    position: 'relative',
    marginTop: 20, // Reduced margin to align better
    borderColor: colors.mutedGold,
    borderWidth: 1,
  },
  profileImage: {
    width: 150, // Slightly larger profile picture
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
    borderWidth: 4,
    borderColor: colors.sacGreen,
    position: 'absolute',
    top: 5,
  },
  header: {
    fontSize: 28, // Larger font for emphasis
    fontWeight: 'bold',
    color: colors.sacGreen,
    marginTop: 90, // Adjusted for larger profile picture
    marginBottom: 10,
    textShadowColor: colors.mutedGold,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  name: {
    fontSize: 24, // Slightly larger font for readability
    fontWeight: '600',
    color: colors.sacGreen,
    marginBottom: 20,
    textAlign: 'center',
  },
  detailsContainer: {
    alignSelf: 'stretch',
    paddingHorizontal: 20, // Increased padding for a more spacious layout
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8, // Slightly increased spacing for better readability
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.mutedGold,
  },
  detailLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.sacGreen,
    width: '45%',
  },
  detail: {
    fontSize: 18,
    color: colors.sacGreen,
    width: '55%',
    textAlign: 'right',
  },
  editButton: {
    marginTop: 30,
    backgroundColor: colors.sacGreen,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderColor: colors.mutedGold,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 18, // Larger font for better visibility
    color: colors.fadedSacGold,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default styles;