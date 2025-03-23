import { StyleSheet } from 'react-native';
import * as colors from '../SacStateColors/GeneralColors';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.white,
      alignItems: 'center',
      justifyContent: 'center',
    },

    progressBar: {
        width: '80%', // You can adjust the width of the progress bar here
        marginBottom: 20, // Space between the progress bar and the button
      },
  });

  export default styles;