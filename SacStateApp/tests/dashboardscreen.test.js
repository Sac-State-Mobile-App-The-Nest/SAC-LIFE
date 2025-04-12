// dashboardscreen.test.js
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: jest.fn(({ children }) => children)
}));

jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

// Mock child components
jest.mock('../src/DashboardComponents/DashboardTab', () => jest.fn(() => null));

// This may fix the View issue, but present others (not sure yet).
/*jest.mock('../src/DashboardComponents/DashboardTab', () => {
  const React = require('react');
  const { View } = require('react-native');
  return jest.fn(() => <View testID="dashboard-tab" />);
});*/
jest.mock('../src/screens/SettingsScreen', () => jest.fn(() => null));
jest.mock('../src/screens/WellnessHomeScreen', () => jest.fn(() => null));
jest.mock('../src/screens/ChatbotScreen', () => jest.fn(() => null));

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import DashboardScreen from '../src/screens/DashboardScreen';
import { View } from 'react-native';

// Provide implementations for mocked components
require('../src/DashboardComponents/DashboardTab').mockImplementation(() => (
  <View testID="dashboard-tab" />
));

require('../src/screens/SettingsScreen').mockImplementation(() => (
  <View testID="settings-screen" />
));

require('../src/screens/WellnessHomeScreen').mockImplementation(() => (
  <View testID="wellness-screen" />
));

require('../src/screens/ChatbotScreen').mockImplementation(() => (
  <View testID="chatbot-screen" />
));

// Mock Ionicons implementation
jest.mock('@expo/vector-icons/Ionicons', () => {
  const { Text } = require('react-native');
  return ({ name, size, color }) => (
    <Text testID={`icon-${name}`}>{name}-icon</Text>
  );
});

// Mock LinearGradient implementation
require('expo-linear-gradient').LinearGradient.mockImplementation(
  ({ colors, style, children }) => (
    <View 
      style={style}
      testColors={colors}
      testID="linear-gradient"
    >
      {children}
    </View>
  )
);

describe('DashboardScreen', () => {
  let renderedComponent;

  beforeAll(() => {
    // Mock all required modules at the start
    jest.mock('@react-native-async-storage/async-storage', () => ({
      getItem: jest.fn(() => Promise.resolve(null)),
      setItem: jest.fn(() => Promise.resolve()),
      removeItem: jest.fn(() => Promise.resolve()),
      clear: jest.fn(() => Promise.resolve()),
    }));

    jest.mock('expo-linear-gradient', () => ({
      LinearGradient: jest.fn(({ children }) => children)
    }));

    jest.mock('@expo/vector-icons/Ionicons', () => {
      const { Text } = require('react-native');
      return ({ name, size, color }) => (
        <Text testID={`icon-${name}`}>{name}-icon</Text>
      );
    });

    // Mock child components
    jest.mock('../src/DashboardComponents/DashboardTab', () => 
      jest.fn(() => <View testID="dashboard-tab" />)
    );
    jest.mock('../src/screens/SettingsScreen', () => 
      jest.fn(() => <View testID="settings-screen" />)
    );
    jest.mock('../src/screens/WellnessHomeScreen', () => 
      jest.fn(() => <View testID="wellness-screen" />)
    );
    jest.mock('../src/screens/ChatbotScreen', () => 
      jest.fn(() => <View testID="chatbot-screen" />)
    );
  });

  beforeEach(async () => {
    renderedComponent = render(
      <NavigationContainer>
        <DashboardScreen />
      </NavigationContainer>
    );
    // Wait for initial render to complete
    await screen.findByText('Dashboard');
  });

  afterEach(() => {
    if (renderedComponent) {
      renderedComponent.unmount();
      renderedComponent = null;
    }
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(screen.getByText('Dashboard')).toBeTruthy();
  });

  it('displays all tab navigation items', () => {
    expect(screen.getByText('Dashboard')).toBeTruthy();
    expect(screen.getByText('HerkyBot')).toBeTruthy();
    expect(screen.getByText('Wellness')).toBeTruthy();
    expect(screen.getByText('Profile')).toBeTruthy();
  });

  it('renders all tab icons', () => {
    expect(screen.getByTestId('icon-home')).toBeTruthy();
    expect(screen.getByTestId('icon-chatbox-ellipses-outline')).toBeTruthy();
    expect(screen.getByTestId('icon-heart')).toBeTruthy();
    expect(screen.getByTestId('icon-person')).toBeTruthy();
  });

  it('navigates between tabs correctly', async () => {
    // Initial tab should be Dashboard
    expect(screen.getByTestId('dashboard-tab')).toBeTruthy();

    // Switch to HerkyBot tab
    await act(async () => {
      fireEvent.press(screen.getByText('HerkyBot'));
    });
    expect(screen.getByTestId('chatbot-screen')).toBeTruthy();
  });

  it('applies correct tab bar styling', () => {
    const tabBar = screen.getByTestId('linear-gradient').parent.parent;
    expect(tabBar.props.style.backgroundColor).toBe('#043927');
    expect(tabBar.props.style.borderTopColor).toBe('#E4CFA3');
    expect(tabBar.props.style.borderTopWidth).toBe(1);
  });
});