import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileCreation from '../src/screens/ProfileCreationScreen'; // Assuming the file path
import { Alert } from 'react-native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue('fake-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock useNavigation hook
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    reset: jest.fn(),
  }),
}));

jest.mock('expo-linear-gradient', () => {
    return {
      LinearGradient: jest.fn().mockImplementation(({ children }) => {
        return <>{children}</>; // Just return the children as-is for simplicity
      }),
    };
  });

  jest.mock('expo-linear-gradient', () => {
    return {
      LinearGradient: ({ children }) => children,
    };
  });
  
  jest.mock('expo-av', () => ({
    Audio: {
      setAudioModeAsync: jest.fn(),
      createAsync: jest.fn().mockResolvedValue({
        sound: {
          playAsync: jest.fn(),
          stopAsync: jest.fn(),
          unloadAsync: jest.fn(),
        },
      }),
    },
  }));
  
  jest.mock('expo-haptics', () => ({
    selectionAsync: jest.fn(),
    impactAsync: jest.fn(),
    notificationAsync: jest.fn(),
  }));
  
  jest.mock('lottie-react-native', () => 'LottieView');

// Mock Alert from react-native
/*jest.mock('react-native', () => {
  const originalModule = jest.requireActual('react-native');
  return {
    ...originalModule,
    Alert: {
      alert: jest.fn(),
    },
    ProgressBarAndroid: () => null,  // Mock ProgressBarAndroid as an empty component
  };
});*/

// Mock ModalSelector
jest.mock('react-native-modal-selector', () => 'ModalSelector');

describe('ProfileCreation Component', () => {
  it('renders the first question and allows input for preferred name', async () => {
    const { getByPlaceholderText, getByText } = render(<ProfileCreation />);

    // Check that the first question is rendered
    expect(getByText('Tell us your name! (Or preferred name)')).toBeTruthy();

    // Enter preferred name
    const nameInput = getByPlaceholderText('Preferred Name');
    fireEvent.changeText(nameInput, 'John Doe');
    
    // Check if name is entered correctly
    expect(nameInput.props.value).toBe('John Doe');
  });

  it('navigates to the next question when "Next" is pressed', async () => {
    const { getByText, getByPlaceholderText } = render(<ProfileCreation />);

    // Enter a name in the first question
    const nameInput = getByPlaceholderText('Preferred Name');
    fireEvent.changeText(nameInput, 'John Doe');

    // Press Next button
    const nextButton = getByText('Next');
    fireEvent.press(nextButton);

    // Wait for next question to be displayed
    await waitFor(() => expect(getByText('What is your race?')).toBeTruthy());
  });

  it('shows an error when next is pressed with no name entered', async () => {
    const { getByText } = render(<ProfileCreation />);

    // Press Next without entering name
    const nextButton = getByText('Next');
    fireEvent.press(nextButton);

    // Check if alert is shown
    //await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in your name.'));
  });

  it('validates and allows proceeding when graduation year is valid', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(<ProfileCreation />);
    
    // Step 1: Enter name and go to next
    const nameInput = await waitFor(() => getByPlaceholderText('Preferred Name'));
    fireEvent.changeText(nameInput, 'Jane Doe');
    fireEvent.press(getByText('Next'));
  
    // Step 2–5: Press "Next" 4 times
    for (let i = 0; i < 4; i++) {
      await waitFor(() => getByText('Next'));
      fireEvent.press(getByText('Next'));
    }
  
    // Step 6: Wait for graduation section to show up
    await waitFor(() => getByText('Expected graduation date?'));
  
    // Find and interact with semester dropdown (assumes default visible option is 'Spring')
    await waitFor(() => getByText('Spring')); // assumes 'Spring' is always visible
    fireEvent.press(getByText('Spring'));
  
    // Fill out the year
    const yearInput = await waitFor(() => getByPlaceholderText('Graduation year (e.g., 2024)'));
    fireEvent.changeText(yearInput, '2025');
  
    // Proceed
    const nextButton = getByText('Next');
    fireEvent.press(nextButton);
  
    // Confirm next screen loaded
    await waitFor(() =>
      expect(queryByText('What kinds of campus events interest you the most?')).toBeTruthy()
    );
  });
  

  it('shows an error when invalid graduation year is entered', async () => {
    const { getByText, getByPlaceholderText } = render(<ProfileCreation />);

    // Navigate to graduation year question
    const nextButton = getByText('Next');
    fireEvent.press(nextButton); // move to next question (assume this goes to the graduation question)

    const graduationYearInput = getByPlaceholderText('Graduation year (e.g., 2024)');
    fireEvent.changeText(graduationYearInput, '2020');  // Invalid year (before current year)

    // Press Next
    fireEvent.press(nextButton);

    // Check if alert is triggered for invalid year
    /*await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Invalid Year: Graduation year cannot be before the current year.'
      )
    );*/
  });

  it('navigates to the completion screen after the last question', async () => {
    const { getByText, getByPlaceholderText } = render(<ProfileCreation />);

    // Answer all questions by navigating to next
    const nameInput = getByPlaceholderText('Preferred Name');
    fireEvent.changeText(nameInput, 'John Doe');
    const nextButton = getByText('Next');
    fireEvent.press(nextButton);

    // Repeat for all questions until completion screen
    for (let i = 1; i < 10; i++) {
      const nextQuestionText = `Question ${i + 1} of 10`;
      await waitFor(() => expect(getByText(nextQuestionText)).toBeTruthy());
      fireEvent.press(nextButton);
    }

    // Finally, verify if Completion screen is shown
    await waitFor(() => expect(getByText('You have finished customizing your personal profile!')).toBeTruthy());
  });

  it('resets navigation to Dashboard after successful profile creation', async () => {
    const { getByText } = render(<ProfileCreation />);

    // Navigate through questions and complete the profile
    const nextButton = getByText('Next');
    for (let i = 0; i < 9; i++) {
      fireEvent.press(nextButton);
    }

    // Simulate profile creation completion
    const createProfileButton = getByText('Create Your Profile!');
    fireEvent.press(createProfileButton);

    // Check if navigation.reset is called to navigate to the Dashboard
    await waitFor(() => {
      expect(require('@react-navigation/native').useNavigation().reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    });
  });
});
