import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';

// First mock all dependencies at the top level
jest.mock('expo-linear-gradient', () => 'LinearGradient');
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

// Then mock the child components using string returns to avoid scoping issues
jest.mock('../DashboardComponents/DashboardTab', () => 'DashboardTab');
jest.mock('./SettingsScreen', () => 'SettingsScreen');
jest.mock('./WellnessHomeScreen', () => 'WellnessHomeScreen');
jest.mock('./ChatbotScreen', () => 'ChatbotScreen');

// Now import the actual component after all mocks are set up
const DashboardScreen = require('./DashboardScreen').default;

describe('DashboardScreen', () => {
  const renderDashboard = () => {
    return render(
      <NavigationContainer>
        <DashboardScreen />
      </NavigationContainer>
    );
  };

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
    
    // Initial state
    expect(dashboardTab.props.accessibilityState.selected).toBe(true);
    expect(herkybotTab.props.accessibilityState.selected).toBe(false);
    
    // After pressing HerkyBot tab
    fireEvent.press(herkybotTab);
    expect(dashboardTab.props.accessibilityState.selected).toBe(false);
    expect(herkybotTab.props.accessibilityState.selected).toBe(true);
  });

  it('applies correct color scheme to tabs', () => {
    renderDashboard();
    
    const dashboardTab = screen.getByText('Dashboard');
    const herkybotTab = screen.getByText('HerkyBot');
    
    // Active tab color
    expect(dashboardTab.props.style.color).toBe('#E4CFA3');
    // Inactive tab color
    expect(herkybotTab.props.style.color).toBe('#B8C9B8');
  });

  it('applies correct tab bar styling', () => {
    renderDashboard();
    
    const tabBar = screen.UNSAFE_getByType('View').find(
      el => el.props.style?.backgroundColor === '#043927'
    );
    
    expect(tabBar).toBeTruthy();
    expect(tabBar.props.style.borderTopColor).toBe('#E4CFA3');
    expect(tabBar.props.style.borderTopWidth).toBe(1);
  });
});