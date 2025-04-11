/*
// Mock expo-font to resolve the issue with Font.isLoaded
jest.mock('expo-font', () => ({
  Font: {
    isLoaded: jest.fn().mockReturnValue(true),  // Mock `Font.isLoaded` to always return true
    loadAsync: jest.fn().mockResolvedValue(true),  // Mock `Font.loadAsync` to always resolve successfully
  },
}));

// Mock react-native-vector-icons MaterialIcons
jest.mock('react-native-vector-icons/MaterialIcons', () => ({
  __esModule: true, // ensures that the mock works with imports
  default: ({ name, size, color }) => (
    <mock-icon name={name} size={size} color={color} />
  ),
}));

// Mock other required Expo dependencies
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  return {
    LinearGradient: ({ children }) => <>{children}</>,
  };
});

jest.mock('@expo/vector-icons/Ionicons', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ name, color, size }) => (
      <mock-ionicon name={name} color={color} size={size} />
    ),
  };
});

// Mock EventEmitter
global.EventEmitter = {
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

// Mock child screens
jest.mock('../src/DashboardComponents/DashboardTab', () => () => <></>);
jest.mock('../src/screens/SettingsScreen', () => () => <></>);
jest.mock('../src/screens/WellnessHomeScreen', () => () => <></>);
jest.mock('../src/screens/ChatbotScreen', () => () => <></>);

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import DashboardScreen from '../src/screens/DashboardScreen'; // Adjust if needed
import DashboardTab from '../src/DashboardComponents/DashboardTab';

describe('DashboardScreen', () => {
  const renderDashboard = () =>
    render(
      <NavigationContainer>
        <DashboardScreen />
      </NavigationContainer>
    );

  it('renders without crashing', () => {
    expect(() => renderDashboard()).not.toThrow();
  });

  it('displays all four tab labels', () => {
    renderDashboard();
    expect(screen.getByText('Dashboard')).toBeTruthy();
    expect(screen.getByText('HerkyBot')).toBeTruthy();
    expect(screen.getByText('Wellness')).toBeTruthy();
    expect(screen.getByText('Profile')).toBeTruthy();
  });

  it('changes active tab when pressed', () => {
    renderDashboard();

    const dashboardTab = screen.getByText('Dashboard');
    const herkybotTab = screen.getByText('HerkyBot');

    expect(dashboardTab.props.accessibilityState?.selected).toBe(true);
    expect(herkybotTab.props.accessibilityState?.selected).toBe(false);

    fireEvent.press(herkybotTab);

    // After press, tabs re-render, so we need fresh elements
    const updatedDashboardTab = screen.getByText('Dashboard');
    const updatedHerkybotTab = screen.getByText('HerkyBot');

    expect(updatedDashboardTab.props.accessibilityState?.selected).toBe(false);
    expect(updatedHerkybotTab.props.accessibilityState?.selected).toBe(true);
  });

  it('renders tab icons correctly with expected names', () => {
    const { UNSAFE_getAllByType } = renderDashboard();

    const icons = UNSAFE_getAllByType('mock-ionicon');
    const iconNames = icons.map(i => i.props.name);

    expect(iconNames).toContain('home');
    expect(iconNames).toContain('person');
    expect(iconNames).toContain('heart');
    expect(iconNames).toContain('chatbox-ellipses-outline');
  });

  it('applies correct tab bar styling', () => {
    const { UNSAFE_getAllByType } = renderDashboard();

    const viewElements = UNSAFE_getAllByType('View');
    const tabBar = viewElements.find(
      el =>
        el.props?.style?.backgroundColor === '#043927' &&
        el.props?.style?.borderTopColor === '#E4CFA3'
    );

    expect(tabBar).toBeTruthy();
    expect(tabBar.props.style.borderTopWidth).toBe(1);
  });
});
*/