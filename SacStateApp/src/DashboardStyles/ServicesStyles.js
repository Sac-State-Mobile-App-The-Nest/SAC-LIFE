import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  serviceContainer: {
    padding: 20,
  },
  servicesHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#043927', // Deep Sac State green
  },
  details: {
    fontSize: 16,
    color: '#6C757D', // Muted tone for additional details
  },
  serviceBox: {
    backgroundColor: '#F7F2E7', // Subtle gold tone for services
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#043927', // Deep green for text
    textAlign: 'center',
  },
});

export default styles;
