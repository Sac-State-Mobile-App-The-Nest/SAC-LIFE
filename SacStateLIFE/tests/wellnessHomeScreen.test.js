// tests/wellnessScreen.test.js
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import WellnessHome from '../src/screens/WellnessHomeScreen'; // make sure path is correct
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        wellnessAnswers: {
          answers: { 0: 5, 1: 5, 2: 5, 3: 5, 4: 5 },
          score: 25,
        },
      }),
  })
);

describe('WellnessHome Screen', () => {
  const mockNavigate = jest.fn();
  const mockAddListener = jest.fn(() => () => {}); // returns unsubscribe function

  const mockNavigation = {
    navigate: mockNavigate,
    addListener: mockAddListener,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue('fake-token');
  });

  it('renders welcome message and health score', async () => {
    const { getByText, queryByText } = render(
      <WellnessHome navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(queryByText(/Your Health Score/i)).toBeTruthy();
      expect(queryByText(/%/)).toBeTruthy();
    });
  });

  it('navigates to WellnessScreen when button is pressed', async () => {
    const { getByText } = render(<WellnessHome navigation={mockNavigation} />);

    const button = await waitFor(() =>
      getByText('Check on your Wellness')
    );
    fireEvent.press(button);

    expect(mockNavigate).toHaveBeenCalledWith('WellnessScreen');
  });
});
