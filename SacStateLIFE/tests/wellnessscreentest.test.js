import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
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

// Mock API calls
global.fetch = jest.fn(() => 
  Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
);

describe('WellnessScreen Unit Tests', () => {
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue('test-token');
    useNavigation.mockReturnValue({ navigate: mockNavigate });
    useFocusEffect.mockImplementation((callback) => callback());
  });

  test('renders first question correctly', () => {
    const { getByText } = render(<WellnessScreen />);
    expect(getByText('Question 1 of 5')).toBeTruthy();
    expect(getByText('Do you feel that you need academic assistance?')).toBeTruthy();
  });

  test('navigates between questions', () => {
    const { getByText } = render(<WellnessScreen />);
    
    // Go to next question
    fireEvent.press(getByText('Next'));
    expect(getByText('Question 2 of 5')).toBeTruthy();
    
    // Go back
    fireEvent.press(getByText('Previous'));
    expect(getByText('Question 1 of 5')).toBeTruthy();
  });

  test('records answer selections', () => {
    const { getByText } = render(<WellnessScreen />);
    fireEvent.press(getByText('Agree'));
    fireEvent.press(getByText('Next'));
    expect(getByText('Question 2 of 5')).toBeTruthy();
  });

  test('shows completion screen after last question', () => {
    const { getByText } = render(<WellnessScreen />);
    
    // Advance through all questions
    for (let i = 0; i < 5; i++) {
      fireEvent.press(getByText('Next'));
    }
    
    expect(getByText('Thank you for checking in on yourself!')).toBeTruthy();
  });

  test('submits answers successfully', async () => {
    const { getByText } = render(<WellnessScreen />);
    
    // Complete all questions
    for (let i = 0; i < 5; i++) {
      fireEvent.press(getByText('Next'));
    }
    
    fireEvent.press(getByText('Complete Check-in!'));
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('Dashboard');
    });
  });

  test('handles submission errors', async () => {
    fetch.mockImplementationOnce(() => Promise.reject(new Error('API Error')));
    jest.spyOn(Alert, 'alert');
    
    const { getByText } = render(<WellnessScreen />);
    
    // Complete all questions
    for (let i = 0; i < 5; i++) {
      fireEvent.press(getByText('Next'));
    }
    
    fireEvent.press(getByText('Complete Check-in!'));
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', expect.any(String));
    });
  });
});