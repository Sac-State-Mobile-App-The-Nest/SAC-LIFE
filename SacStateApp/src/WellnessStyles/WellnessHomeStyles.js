import { StyleSheet, Dimensions } from 'react-native';
import * as colors from '../SacStateColors/GeneralColors'; // Import colors if needed

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
   // added for image background testing
    backgroundImage: {
      flex: 1,
      width: '100%',
      height: '100%',
    },

   scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5', // Light gray background for the entire screen
  },
  container: {
    width: '90%',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF', // White background for the content container
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.sacGreen,
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
  },
  healthScoreContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  healthScoreText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.sacGreen,
    marginBottom: 10,
  },
  healthBarContainer: {
    width: '100%',
    height: 30, // Increased height for the health bar
    backgroundColor: '#E0E0E0',
    borderRadius: 15, // Adjusted border radius to match the new height
    overflow: 'hidden',
    marginBottom: 10,
    justifyContent: 'center', // Center the percentage text vertically
  },
  healthBar: {
    height: '100%',
    justifyContent: 'center', // Center the percentage text horizontally
    alignItems: 'center', // Center the percentage text horizontally
  },
  percentageText: {
    color: '#FFFFFF', // White text for better visibility
    fontSize: 14, // Slightly larger font size
    fontWeight: 'bold',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: colors.sacGreen,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.sacGreen,
    alignItems: 'center',
    marginBottom: 30,
  },
  secondaryButtonText: {
    color: colors.sacGreen,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default styles;