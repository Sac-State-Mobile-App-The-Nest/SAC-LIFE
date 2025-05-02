// wellnessScreenTest.test.js
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import WellnessScreen from '../src/screens/WellnessScreen';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useFocusEffect: jest.fn(),
}));

const mockNavigate = jest.fn();
useNavigation.mockReturnValue({ navigate: mockNavigate });
useFocusEffect.mockImplementation((callback) => callback());

describe('WellnessCreation Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue('mock-token');
  });

  it('renders the first question correctly', () => {
    const { getByText } = render(<WellnessScreen />);
    expect(getByText('Question 1 of 6')).toBeTruthy();
    expect(getByText('Do you feel that you need academic assistance?')).toBeTruthy();
  });

  it('navigates to next question when Next button is pressed', () => {
    const { getByText } = render(<WellnessScreen />);
    fireEvent.press(getByText('Next'));
    expect(getByText('Question 2 of 6')).toBeTruthy();
    expect(getByText('I feel safe on campus.')).toBeTruthy();
  });

  it('navigates back to previous question when Previous button is pressed', () => {
    const { getByText } = render(<WellnessScreen />);
    
    // Go to second question first
    fireEvent.press(getByText('Next'));
    expect(getByText('Question 2 of 6')).toBeTruthy();
    
    // Then go back
    fireEvent.press(getByText('Previous'));
    expect(getByText('Question 1 of 6')).toBeTruthy();
  });

  it('records answers correctly for checkbox questions', () => {
    const { getByText } = render(<WellnessScreen />);
    fireEvent.press(getByText('Agree'));
    fireEvent.press(getByText('Next'));
    expect(getByText('Question 2 of 6')).toBeTruthy();
  });

  it('shows completion screen after last question', () => {
    const { getByText, queryByText } = render(<WellnessScreen />);
    
    // Fast-forward through all questions
    for (let i = 0; i < 6; i++) {
      fireEvent.press(getByText('Next'));
    }
    
    expect(queryByText('Thank you for checking in on yourself!')).toBeTruthy();
    expect(getByText('Complete Check-in!')).toBeTruthy();
  });

  it('submits answers successfully', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );
    
    const { getByText } = render(<WellnessScreen />);
    
    // Fast-forward through all questions
    for (let i = 0; i < 6; i++) {
      fireEvent.press(getByText('Next'));
    }
    
    // Submit
    await act(async () => {
      fireEvent.press(getByText('Complete Check-in!'));
    });
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('Dashboard');
    });
  });

  it('handles submission error gracefully', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Network error'))
    );
    jest.spyOn(Alert, 'alert');
    
    const { getByText } = render(<WellnessScreen />);
    
    // Fast-forward through all questions
    for (let i = 0; i < 6; i++) {
      fireEvent.press(getByText('Next'));
    }
    
    // Submit
    await act(async () => {
      fireEvent.press(getByText('Complete Check-in!'));
    });
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to send your answers. Please try again.');
    });
  });
});

