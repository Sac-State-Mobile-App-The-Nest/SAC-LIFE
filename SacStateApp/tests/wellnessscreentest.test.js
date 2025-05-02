import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import WellnessCreation from '../src/screens/WellnessScreen';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useFocusEffect: jest.fn(),
}));

// Mock API calls
global.fetch = jest.fn(() => 
  Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
);

describe('WellnessScreen Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue('test-token');
  });

  test('renders first question correctly', () => {
    const { getByText } = render(<WellnessCreation />);
    expect(getByText('Question 1 of 5')).toBeTruthy();
    expect(getByText('Do you feel that you need academic assistance?')).toBeTruthy();
  });

  test('navigates between questions', () => {
    const { getByText } = render(<WellnessCreation />);
    
    // Go to next question
    fireEvent.press(getByText('Next'));
    expect(getByText('Question 2 of 5')).toBeTruthy();
    
    // Go back
    fireEvent.press(getByText('Previous'));
    expect(getByText('Question 1 of 5')).toBeTruthy();
  });

  test('records answer selections', () => {
    const { getByText } = render(<WellnessCreation />);
    fireEvent.press(getByText('Agree'));
    fireEvent.press(getByText('Next'));
    expect(getByText('Question 2 of 5')).toBeTruthy();
  });

  test('shows completion screen after last question', () => {
    const { getByText } = render(<WellnessCreation />);
    
    // Advance through all questions
    for (let i = 0; i < 5; i++) {
      fireEvent.press(getByText('Next'));
    }
    
    expect(getByText('Thank you for checking in on yourself!')).toBeTruthy();
  });

  test('submits answers successfully', async () => {
    const { getByText } = render(<WellnessCreation />);
    
    // Complete all questions
    for (let i = 0; i < 5; i++) {
      fireEvent.press(getByText('Next'));
    }
    
    fireEvent.press(getByText('Complete Check-in!'));
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  test('handles submission errors', async () => {
    fetch.mockImplementationOnce(() => Promise.reject(new Error('API Error')));
    jest.spyOn(Alert, 'alert');
    
    const { getByText } = render(<WellnessCreation />);
    
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