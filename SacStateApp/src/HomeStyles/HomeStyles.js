import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
  
  const stylesC = StyleSheet.create({
    chatWidgetContainer: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      zIndex: 1000, // Ensures it stays on top of other elements
    },
  });

  export default styles;