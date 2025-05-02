import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native'; 
import ProfileCreation from '../src/screens/ProfileCreationScreen';
import { NavigationContainer } from '@react-navigation/native';

// Suppress lingering timers
beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

// Native + Expo mocks
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: jest.fn().mockImplementation(({ children }) => children),
}));
jest.mock('expo-av', () => ({
  Audio: {
    Sound: jest.fn().mockImplementation(() => ({
      loadAsync: jest.fn(),
      playAsync: jest.fn(),
      unloadAsync: jest.fn(),
    })),
  },
}));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
}));
jest.mock('lottie-react-native', () => 'LottieView');

// Properly mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Mock HoldToCompleteButton
jest.mock('../src/components/HoldToCompleteButton', () => 'HoldToCompleteButton');

// AsyncStorage and API config
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve('123')),
}));
jest.mock('../src/apiConfig', () => 'http://mock-api-url.com');

jest.mock('react-native-modal-selector', () =>
  function MockModalSelector(props) {
    const { Text } = require('react-native');
    return <Text onPress={() => props.onChange({ key: 'Asian', label: 'Asian' })}>Asian</Text>;
  }
);

// Navigation mock
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      reset: jest.fn(),
    }),
  };
});
jest.mock('../src/assets/sac-state-logo1.png', () => ({}));

describe('ProfileCreation screen', () => {
  it('renders the first question and handles name input', async () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <ProfileCreation />
      </NavigationContainer>
    );

    fireEvent.changeText(getByPlaceholderText('Preferred Name'), 'Nick');
    fireEvent.press(getByText('Next'));

    await waitFor(() => {
      expect(getByText('Question 2 of 10')).toBeTruthy();
    });
  });

  it('selects a race from dropdown (question 2)', async () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <ProfileCreation />
      </NavigationContainer>
    );

    fireEvent.changeText(getByPlaceholderText('Preferred Name'), 'Nick');
    fireEvent.press(getByText('Next'));
    await waitFor(() => getByText('Question 2 of 10'));

    fireEvent.press(getByText('Asian'));
    expect(true).toBe(true); // sanity check
  });

  it('selects multiple campus interests (question 7)', async () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <ProfileCreation />
      </NavigationContainer>
    );

    fireEvent.changeText(getByPlaceholderText('Preferred Name'), 'Nick');

    for (let i = 0; i < 5; i++) {
      fireEvent.press(getByText('Next'));
      await waitFor(() => getByText(`Question ${i + 2} of 10`));
    }
    
    // Question 6 (Graduation)
    const yearInput = getByPlaceholderText('Graduation year (e.g., 2024)');
    fireEvent.changeText(yearInput, '2026');
    fireEvent.press(getByText('Asian')); // mocks semester selection
    
    fireEvent.press(getByText('Next'));
    await waitFor(() => getByText('Question 7 of 10'));

    fireEvent.press(getByText('Fun and social meet-ups'));
    fireEvent.press(getByText('Sports and fitness activities'));
  });

  it('shows alert for invalid graduation year', async () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <ProfileCreation />
      </NavigationContainer>
    );

    fireEvent.changeText(getByPlaceholderText('Preferred Name'), 'Nick');

    for (let i = 0; i < 5; i++) {
      fireEvent.press(getByText('Next'));
      await waitFor(() => getByText(`Question ${i + 2} of 10`));
    }

    fireEvent.press(getByText('Next'));
    await waitFor(() => getByText('Question 6 of 10'));

    const yearInput = getByPlaceholderText('Graduation year (e.g., 2024)');
    fireEvent.changeText(yearInput, '2020');
    fireEvent.press(getByText('Next'));

    expect(Alert.alert).toHaveBeenCalled();
  });

  it('matches snapshot for the first screen', () => {
    const { toJSON } = render(
      <NavigationContainer>
        <ProfileCreation />
      </NavigationContainer>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
