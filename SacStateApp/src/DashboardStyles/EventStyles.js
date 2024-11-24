import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  eventTab: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF', // White for clean content
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  eventDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#043927', // Deep Sac State green
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#043927',
  },
  eventDescription: {
    fontSize: 16,
    color: '#6C757D', // Subtle muted tone for descriptions
    marginTop: 10,
  },
});

export default styles;
