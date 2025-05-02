import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SettingsScreen from '../src/screens/SettingsScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Mock the API functions directly
jest.mock('../src/DashboardAPI/api', () => ({
  fetchUserAreaOfStudy: jest.fn(() => Promise.resolve([{ tag_name: 'computer science' }])),
  fetchUserYearOfStudy: jest.fn(() => Promise.resolve([{ tag_name: 'senior' }])),
}));

// Mock other dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('axios');
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock the ProfileModals component
jest.mock('../src/SettingsScreenComponents/ProfileModals', () => 'ProfileModals');

describe('SettingsScreen', () => {
  const mockNavigation = {
    reset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks(); // Clear any previous mocks

    // Mock AsyncStorage methods
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return Promise.resolve('mock-token');
      if (key === 'authToken') return Promise.resolve('mock-auth-token');
      return Promise.resolve(null);
    });

    AsyncStorage.setItem.mockResolvedValue();
    AsyncStorage.removeItem.mockResolvedValue();

    // Mock axios responses
    axios.get.mockResolvedValue({
      data: {
        preferred_name: 'John',
        first_name: 'John',
        last_name: 'Doe'
      }
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
    expect(getByText('General')).toBeTruthy();
    expect(getByText('Security & Privacy')).toBeTruthy();
    expect(getByText('About & Legal')).toBeTruthy();
  });

  it('handles logout correctly', async () => {
    const { getByText } = render(
      <SettingsScreen navigation={mockNavigation} />
    );
    
    fireEvent.press(getByText('Logout'));
    
    await waitFor(() => {
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'LogIn' }],
      });
    });
  });

  describe('API Integration', () => {
    it('fetches user data on mount', async () => {
      render(<SettingsScreen navigation={mockNavigation} />);
      
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('/api/students/getName'),
          expect.objectContaining({
            headers: { Authorization: 'Bearer mock-token' }
          })
        );
        expect(require('../DashboardAPI/api').fetchUserAreaOfStudy).toHaveBeenCalledWith('mock-token');
        expect(require('../DashboardAPI/api').fetchUserYearOfStudy).toHaveBeenCalledWith('mock-token');
      });
    });

    it('handles API errors gracefully', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));
      require('../DashboardAPI/api').fetchUserAreaOfStudy.mockRejectedValue(new Error('API error'));
      
      const { findByText } = render(
        <SettingsScreen navigation={mockNavigation} />
      );
      
      // Should still render basic UI
      await expect(findByText('General')).resolves.toBeTruthy();
    });
  });

  describe('updateNameFunction', () => {
    let settingsInstance;

    beforeEach(() => {
      settingsInstance = new SettingsScreen({ navigation: mockNavigation });
      settingsInstance.setState({
        userInfo: { preferred_name: 'John' },
        newPreferredName: ''
      });
    });

    it('rejects empty name', async () => {
      await settingsInstance.updateNameFunction();
      expect(axios.put).not.toHaveBeenCalled();
    });

    it('rejects invalid characters', async () => {
      settingsInstance.setState({ newPreferredName: 'John123' });
      await settingsInstance.updateNameFunction();
      expect(axios.put).not.toHaveBeenCalled();
    });

    it('updates name successfully', async () => {
      settingsInstance.setState({ newPreferredName: 'Jonathan' });
      await settingsInstance.updateNameFunction();
      
      await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith(
          expect.stringContaining('/api/students/updatePreferredName'),
          { newPreferredName: 'Jonathan' },
          {
            headers: { Authorization: 'Bearer mock-token' }
          }
        );
      });
    });
  });

  describe('updatePasswordFunction', () => {
    let settingsInstance;

    beforeEach(() => {
      settingsInstance = new SettingsScreen({ navigation: mockNavigation });
    });

    it('rejects mismatched passwords', async () => {
      await settingsInstance.updatePasswordFunction('oldpass', 'newpass1', 'newpass2');
      expect(axios.put).not.toHaveBeenCalled();
    });

    it('rejects short passwords', async () => {
      await settingsInstance.updatePasswordFunction('oldpass', 'short', 'short');
      expect(axios.put).not.toHaveBeenCalled();
    });

    it('updates password successfully', async () => {
      await settingsInstance.updatePasswordFunction('oldpass', 'newValidPass123', 'newValidPass123');
      
      await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith(
          expect.stringContaining('/api/login_info/updatePassword'),
          {
            oldPassword: 'oldpass',
            newPassword: 'newValidPass123'
          },
          {
            headers: { Authorization: 'Bearer mock-token' }
          }
        );
      });
    });
  });

  describe('Utility Functions', () => {
    it('capitalizes words correctly', () => {
      const instance = new SettingsScreen({ navigation: mockNavigation });
      expect(instance.capitalizeWords('computer science')).toBe('Computer Science');
      expect(instance.capitalizeWords('first year')).toBe('First Year');
    });
  });
});
