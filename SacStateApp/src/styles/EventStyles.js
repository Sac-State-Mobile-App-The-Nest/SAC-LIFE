import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  eventTab: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
  },
  eventDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#043927',
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#043927',
  },
  eventDescription: {
    fontSize: 16,
    color: '#043927',
    marginTop: 10,
  },
});

export default styles;
