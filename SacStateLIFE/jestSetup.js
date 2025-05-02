jest.mock('expo-font', () => ({
    useFonts: jest.fn(() => [true]),  // Mocking the useFonts hook
  }));
  
  jest.mock('expo-modules-core', () => ({
    EventEmitter: { addListener: jest.fn(), removeListener: jest.fn() },
  }));

  jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return {
      Ionicons: (props) => <Text>{props.name}</Text>,
      MaterialIcons: (props) => <Text>{props.name}</Text>,
      FontAwesome: (props) => <Text>{props.name}</Text>,
      // Add other icon sets you're using here if needed
    };
  });
  