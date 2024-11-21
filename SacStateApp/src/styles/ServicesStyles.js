import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  serviceContainer: {
    padding: 20,
  },
  servicesHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'rgb(0, 46, 35)',
  },
  details: {
    fontSize: 16,
    color: 'gray',
  },
  serviceBox: {
    backgroundColor: '#f0f0f0',
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
    color: 'rgb(0,132,83)',
    textAlign: 'center',
  },
});

export default styles;

