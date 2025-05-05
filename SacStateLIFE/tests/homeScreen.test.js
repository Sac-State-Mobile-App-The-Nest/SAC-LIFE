import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Dashboard from '../src/screens/HomeScreen.js'; // Adjust path if needed

const mockNavigate = jest.fn();

const createTestProps = () => ({
  navigation: {
    navigate: mockNavigate,
  },
});

describe('HomeScreen Dashboard', () => {
  beforeEach(() => {
    mockNavigate.mockClear(); // Reset calls before each test
  });

  it('renders all navigation buttons', () => {
    const props = createTestProps();
    const { getByText } = render(<Dashboard {...props} />);
    
    expect(getByText('Go to Dashboard')).toBeTruthy();
    expect(getByText('Go to Log In')).toBeTruthy();
    expect(getByText('Go to Profile Creation')).toBeTruthy();
  });

  it('navigates to Dashboard onPress', () => {
    const props = createTestProps();
    const { getByText } = render(<Dashboard {...props} />);
    
    fireEvent.press(getByText('Go to Dashboard'));
    expect(mockNavigate).toHaveBeenCalledWith('Dashboard');
  });

  it('navigates to Log In onPress', () => {
    const props = createTestProps();
    const { getByText } = render(<Dashboard {...props} />);
    
    fireEvent.press(getByText('Go to Log In'));
    expect(mockNavigate).toHaveBeenCalledWith('LogIn');
  });

  it('navigates to Profile Creation onPress', () => {
    const props = createTestProps();
    const { getByText } = render(<Dashboard {...props} />);
    
    fireEvent.press(getByText('Go to Profile Creation'));
    expect(mockNavigate).toHaveBeenCalledWith('ProfileCreation');
  });
});