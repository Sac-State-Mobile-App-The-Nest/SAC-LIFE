import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SettingsScreen from '../src/screens/SettingsScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Mock the Dashboard API methods
jest.mock('../src/DashboardAPI/api', () => ({
  fetchUserAreaOfStudy: jest.fn(() => Promise.resolve([{ tag_name: 'computer science' }])),
  fetchUserYearOfStudy: jest.fn(() => Promise.resolve([{ tag_name: 'senior' }])),
}));

// Other dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('axios');
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));
jest.mock('../src/SettingsScreenComponents/ProfileModals', () => 'ProfileModals');

describe('SettingsScreen', () => {
  const mockNavigation = {
    reset: jest.fn(),
    addListener: jest.fn(() => jest.fn()), // to suppress navigation warning
  };

  beforeEach(() => {
    jest.clearAllMocks();

    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return Promise.resolve('mock-token');
      if (key === 'authToken') return Promise.resolve('mock-auth-token');
      return Promise.resolve(null);
    });

    AsyncStorage.setItem.mockResolvedValue();
    AsyncStorage.removeItem.mockResolvedValue();

    axios.get.mockResolvedValue({
      data: { preferred_name: 'John', first_name: 'John', last_name: 'Doe' }
    });

    axios.put.mockResolvedValue({ data: { success: true } });
  });

  it('renders correctly with user data', async () => {
    const { getByText, findByText } = render(
      <SettingsScreen navigation={mockNavigation} />
    );
    await findByText('John');
    expect(getByText('Computer Science')).toBeTruthy();
    expect(getByText('Grade: Senior')).toBeTruthy();
  });

  it.skip('handles logout correctly', async () => {
    const { getByText } = render(<SettingsScreen navigation={mockNavigation} />);

    // Tap "Logout" button
    fireEvent.press(getByText('Logout'));

    // Tap the confirmation button in the modal
    const confirmButton = await waitFor(() => getByText('Yes'));
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'LogIn' }],
      });
    });
  });

  it('fetches user data on mount', async () => {
    render(<SettingsScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/students/getName'),
        expect.objectContaining({ headers: { Authorization: 'Bearer mock-token' } })
      );
    });
  });

  it('handles API errors gracefully', async () => {
    axios.get.mockRejectedValue(new Error('fail'));
    require('../src/DashboardAPI/api').fetchUserAreaOfStudy.mockRejectedValue(new Error('fail'));
    require('../src/DashboardAPI/api').fetchUserYearOfStudy.mockRejectedValue(new Error('fail'));

    const { findByText } = render(<SettingsScreen navigation={mockNavigation} />);
    await expect(findByText('General')).resolves.toBeTruthy(); // Still loads fallback UI
  });
});