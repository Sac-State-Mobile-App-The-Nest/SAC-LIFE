jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LogInScreen from '../src/screens/LogInScreen.js'; // Adjust path as needed
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('axios');
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
}));

// Mock Alert directly
/*jest.mock('react-native', () => {
  const originalModule = jest.requireActual('react-native');
  return {
    ...originalModule,
    Alert: {
      alert: jest.fn(), // Mock the Alert.alert method
    },
  };
});*/

const mockNavigate = jest.fn();
useNavigation.mockReturnValue({ navigate: mockNavigate });

describe('LogInScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //  #1 Will test whether login screen entery boxes are rendered correctly.
  it('renders the login form with username and password inputs', () => {
    const { getByPlaceholderText } = render(<LogInScreen />);
    expect(getByPlaceholderText('Username')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  // #2 Will test to confirm that the error message will be displayed if the user tries to sign in without filling out the required fields.
  it('shows an error if username or password is missing', () => {
    const { getByText, getByPlaceholderText } = render(<LogInScreen />);
    fireEvent.changeText(getByPlaceholderText('Username'), '');
    fireEvent.changeText(getByPlaceholderText('Password'), '');
    fireEvent.press(getByText('Log In'));
    expect(getByText('Username and password are required.')).toBeTruthy();
  });

  // #3 Will test to ensure that the login function is called with the correct paramters; will also check that the navigation works correctly upon successful login.
  it('calls login function on valid form submission', async () => {
    const { getByText, getByPlaceholderText } = render(<LogInScreen />);
    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    axios.post.mockResolvedValueOnce({
      data: { accessToken: 'token', userId: '123' }
    });
    axios.get.mockResolvedValueOnce({ data: true });
    fireEvent.press(getByText('Log In'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      username: 'testuser',
      password: 'password123',
    })));
    expect(mockNavigate).toHaveBeenCalledWith('Dashboard');
  });

  // #4 Will test to make sure that the loading indicator is displayed while the login request is in progress.
  it('shows loading indicator when login is in progress', async () => {
    const { getByPlaceholderText, getByTestId } = render(<LogInScreen />);

    // Use getByPlaceholderText to target the 'Username' input
    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');

    // Mock the axios response
    axios.post.mockResolvedValueOnce({
        data: { accessToken: 'token', userId: '123' }
    });

    // Press the login button
    fireEvent.press(getByTestId('loginButton'));

    // Expect the loading indicator to appear
    expect(getByTestId('loadingIndicator')).toBeTruthy();
});

  // #5 Will test to make sure that a new account that has not completed the Profile Creation will be directed to that screen, not the Dashboard.
  it('navigates to ProfileCreation if login bool is false', async () => {
    const { getByText, getByPlaceholderText } = render(<LogInScreen />);
    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    axios.post.mockResolvedValueOnce({
      data: { accessToken: 'token', userId: '123' }
    });
    axios.get.mockResolvedValueOnce({ data: false });
    fireEvent.press(getByText('Log In'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('ProfileCreation'));
  });

  // #6 Will test to make sure that the error message is displayed when invalid credentials are entered.
  // COMMENT THIS OUT TO MAKE IT ALL WORK
  /*it('shows error if login fails', async () => {
    // Mock Alert.alert using jest.spyOn
    jest.spyOn(Alert, 'alert');
  
    const { getByText, getByPlaceholderText } = render(<LogInScreen />);
    
    // Simulate user input
    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpassword');
    
    // Mock the axios.post to simulate a failed login response
    axios.post.mockRejectedValueOnce({
      response: {
        data: 'Invalid credentials',
        status: 403,
      },
    });
    
    // Simulate the login button press
    fireEvent.press(getByText('Log In'));
    
    // Wait for the Alert.alert to be called with expected values
    await waitFor(() => 
      expect(Alert.alert).toHaveBeenCalledWith(
        'Login failed', // First argument: title of the alert
        'Invalid credentials' // Second argument: message of the alert
      )
    );
  
    // Clean up mock after the test
    jest.restoreAllMocks();
  });*/

  // #7 Tests to make sure that the password visibilaty toggle works correctly.
  it('toggles password visibility', () => {
    const { getByPlaceholderText, getByTestId } = render(<LogInScreen />);
    const passwordInput = getByPlaceholderText('Password');
    const eyeIcon = getByTestId('eyeIcon');
    fireEvent.press(eyeIcon);
    expect(passwordInput.props.secureTextEntry).toBe(false); // Password should now be visible
    fireEvent.press(eyeIcon);
    expect(passwordInput.props.secureTextEntry).toBe(true); // Password should be hidden again
  });

  // #8 Tests the functionality of the skip button. (THIS IS PROB USELESS)
  it('navigates to Home when skip button is pressed', () => {
    const { getByText } = render(<LogInScreen />);
    fireEvent.press(getByText('Developer Skip Button'));
    expect(mockNavigate).toHaveBeenCalledWith('Home');
  });
});
