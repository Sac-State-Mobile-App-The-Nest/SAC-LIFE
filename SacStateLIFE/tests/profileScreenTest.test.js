import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import ProfileScreen from '../src/screens/ProfileScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('axios');
jest.mock('../assets/defaultPFP.png', () => 'mocked-image');
jest.mock('../src/styles/ProfileStyles', () => ({
  safeArea: {},
  background: {},
  container: {},
  goldBackground: {},
  profileImage: {},
  header: {},
  name: {},
  detailsContainer: {},
  detailRow: {},
  detailLabel: {},
  detail: {},
  editButton: {},
  editButtonText: {},
}));

describe('ProfileScreen', () => {
  const fullUser = {
    f_name: 'John',
    m_name: 'H.',
    l_name: 'Doe',
  };

  const noMiddleNameUser = {
    f_name: 'Jane',
    m_name: null,
    l_name: 'Smith',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue('mock-token');
  });

  // #1 Tests to make sure there is a loading state.
  it('renders loading text initially', () => {
    const { getByText } = render(<ProfileScreen />);
    expect(getByText('Loading Name')).toBeTruthy();
  });

  // #2 Tests to make sure that a middle name is formated correctly.
  it('displays user name after fetching with middle name', async () => {
    axios.get.mockResolvedValue({ data: fullUser });

    const { queryByText } = render(<ProfileScreen />);
    await waitFor(() => {
      expect(queryByText('John H. Doe')).toBeTruthy();
    });
  });

  // #3 Tests to make sure that the name is presented correctly without a middle name.
  it('displays user name correctly without middle name', async () => {
    axios.get.mockResolvedValue({ data: noMiddleNameUser });

    const { queryByText } = render(<ProfileScreen />);
    await waitFor(() => {
      expect(queryByText('Jane Smith')).toBeTruthy();
    });
  });

  // #4 Tests to make sure all hardcoded profile details are correctly visible (ex. email, phone#, etc.).
  it('displays static profile info fields', () => {
    const { getByText } = render(<ProfileScreen />);

    expect(getByText('My Profile')).toBeTruthy();
    expect(getByText('Email:')).toBeTruthy();
    expect(getByText('johndoe@example.com')).toBeTruthy();
    expect(getByText('Phone Number:')).toBeTruthy();
    expect(getByText('123-456-7890')).toBeTruthy();
    expect(getByText('Major:')).toBeTruthy();
    expect(getByText('Computer Science')).toBeTruthy();
    expect(getByText('Year:')).toBeTruthy();
    expect(getByText('Undergraduate')).toBeTruthy();
    expect(getByText('Student Type:')).toBeTruthy();
    expect(getByText('Transfer')).toBeTruthy();
  });

  // #5 Tests to make sure that the API uses the correct token (correct URL and Authorization header).
  it('calls the API with correct token', async () => {
    axios.get.mockResolvedValue({ data: fullUser });

    render(<ProfileScreen />);
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/students/getName'),
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer mock-token',
          },
        })
      );
    });
  });

  // #6 Tests to make sure that in the case of an API error, the app does not and correctly displays the error to the console.
  it('handles API error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValue(new Error('API failure'));

    render(<ProfileScreen />);
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error displaying user first and last name: ',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  // #7 Tests the rendering and "pressability" of the edit button.
  it('renders and allows pressing the Edit Profile button', () => {
    const { getByText } = render(<ProfileScreen />);
    const editButton = getByText('Edit Profile');

    expect(editButton).toBeTruthy();
    fireEvent.press(editButton);
    // No effect to assert yet, but we verify it's pressable.
  });
});
