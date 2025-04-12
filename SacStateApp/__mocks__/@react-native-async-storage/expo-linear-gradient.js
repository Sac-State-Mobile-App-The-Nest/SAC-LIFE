// __mocks__/expo-linear-gradient.js
import React from 'react';
import { View } from 'react-native';

const LinearGradient = ({ children }) => {
  return <View>{children}</View>; // Just return a View for testing
};

export { LinearGradient };
