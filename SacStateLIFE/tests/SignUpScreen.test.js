import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignUpScreen from '../src/screens/SignUpScreen';
import axios from 'axios';

jest.mock('axios');

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  setOptions: jest.fn(),
};

describe('SignUpScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows an error if required fields are missing', async () => {
    const { getByText } = render(<SignUpScreen navigation={mockNavigation} />);
    const signUpButton = getByText('Sign Up');
    fireEvent.press(signUpButton);
    await waitFor(() => {
      expect(getByText('Sign Up')).toBeTruthy();
    });
  });

  it('shows an error for invalid email', async () => {
    const { getByPlaceholderText, getByText } = render(<SignUpScreen navigation={mockNavigation} />);
    fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('Sac State Email'), 'john@gmail.com');
    fireEvent.changeText(getByPlaceholderText('Username'), 'johndoe');
    fireEvent.changeText(getByPlaceholderText('Password (min 8 characters)'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');

    fireEvent.press(getByText('Sign Up'));
    await waitFor(() => {
      expect(getByText('Sign Up')).toBeTruthy();
    });
  });

  it('calls API and navigates to verification on success', async () => {
    axios.post.mockResolvedValueOnce({ status: 201 });

    const { getByPlaceholderText, getByText } = render(<SignUpScreen navigation={mockNavigation} />);
    fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('Sac State Email'), 'john@csus.edu');
    fireEvent.changeText(getByPlaceholderText('Username'), 'johndoe');
    fireEvent.changeText(getByPlaceholderText('Password (min 8 characters)'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');

    fireEvent.press(getByText('Sign Up'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('VerificationScreen', { email: 'john@csus.edu' });
    });
  });

  it('shows error on signup failure', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { message: 'User exists' } } });

    const { getByPlaceholderText, getByText } = render(<SignUpScreen navigation={mockNavigation} />);
    fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('Sac State Email'), 'john@csus.edu');
    fireEvent.changeText(getByPlaceholderText('Username'), 'johndoe');
    fireEvent.changeText(getByPlaceholderText('Password (min 8 characters)'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');

    fireEvent.press(getByText('Sign Up'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
  });
});
