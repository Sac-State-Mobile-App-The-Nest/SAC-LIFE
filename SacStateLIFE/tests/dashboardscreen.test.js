// dashboardscreen.test.js
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import DashboardScreen from '../src/screens/DashboardScreen';
import Ionicons from '@expo/vector-icons/Ionicons';
import { View, Text } from 'react-native';

// Mocks
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ colors, style, children }) => (
      <View style={style} testColors={colors} testID="linear-gradient">
        {children}
      </View>
    ),
  };
});

jest.mock('@expo/vector-icons/Ionicons', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ name }) => <Text testID={`icon-${name}`}>{name}-icon</Text>
  };
});

// Screen and component mocks as proper React components
jest.mock('../src/DashboardComponents/DashboardTab', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => <View testID="dashboard-tab" />;
});

jest.mock('../src/screens/SettingsScreen', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => <View testID="settings-screen" />;
});

jest.mock('../src/screens/WellnessHomeScreen', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => <View testID="wellness-screen" />;
});

jest.mock('../src/screens/ChatbotScreen', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => <View testID="chatbot-screen" />;
});

// Tests
describe('DashboardScreen', () => {
  let renderedComponent;

  beforeEach(async () => {
    renderedComponent = render(
      <NavigationContainer>
        <DashboardScreen />
      </NavigationContainer>
    );
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
    expect(screen.getByTestId('dashboard-tab')).toBeTruthy();

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
