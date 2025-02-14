import { StyleSheet, Dimensions } from 'react-native';
import * as colors from '../SacStateColors/GeneralColors';

const { width } = Dimensions.get('window');
const containerWidth = width * 0.8;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sacGreen, // Sacramento State green
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
  textContainer: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  messageText: {
    fontSize: 24,
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
    position: 'absolute', // Overlap for a smooth transition.
  },
  loadingBarContainer: {
    position: 'absolute',
    bottom: 40,               // Moved higher on the screen.
    width: containerWidth,    // 80% of screen width.
    height: 15,               // Increased thickness.
    backgroundColor: colors.lightGray, // Track color.
    borderRadius: 7.5,         // Half of height for rounded edges.
    overflow: 'hidden',
    alignSelf: 'center',
  },
  loadingBar: {
    flex: 1,
    backgroundColor: colors.white, // Loading bar color.
  },
});

export default styles;
