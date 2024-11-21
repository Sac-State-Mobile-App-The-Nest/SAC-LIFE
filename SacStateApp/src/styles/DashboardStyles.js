import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  scrollViewContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  goldBackground: {
    backgroundColor: '#c4b581',
    padding: 20,
    borderRadius: 10,
    flex: 1,
    alignSelf: 'stretch',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logo: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: 10,
    left: 10,
  },
  button: {
    backgroundColor: '#043927',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
});

export default styles;
