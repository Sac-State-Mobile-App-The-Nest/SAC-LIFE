import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AllServicesScreen from '../src/screens/AllServicesScreen';
import { Linking } from 'react-native';

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

// Mock Linking
jest.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve());

const servicesMock = [
  { serv_name: 'Academic Advising', service_link: 'https://example.com/advising' },
  { serv_name: 'Career Center', service_link: 'https://example.com/career' },
  { serv_name: 'Invalid Link', service_link: 'notalink' },
];

describe('AllServicesScreen', () => {
  it('renders header and search bar', () => {
    const { getByText, getByPlaceholderText } = render(
      <AllServicesScreen route={{ params: { services: servicesMock } }} />
    );

    expect(getByText('Your Services')).toBeTruthy();
    expect(getByPlaceholderText('Type to search...')).toBeTruthy();
  });

  it('filters services based on search query', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <AllServicesScreen route={{ params: { services: servicesMock } }} />
    );

    const input = getByPlaceholderText('Type to search...');
    fireEvent.changeText(input, 'career');

    expect(getByText('Career Center')).toBeTruthy();
    expect(queryByText('Academic Advising')).toBeNull();
  });

  it('navigates back when back button is pressed', () => {
    const { getByRole } = render(
      <AllServicesScreen route={{ params: { services: servicesMock } }} />
    );

    const backButton = getByRole('button');
    fireEvent.press(backButton);

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('opens valid service link when pressed', async () => {
    const { getByText } = render(
      <AllServicesScreen route={{ params: { services: servicesMock } }} />
    );

    const serviceButton = getByText('Academic Advising');
    fireEvent.press(serviceButton);

    await waitFor(() => {
      expect(Linking.openURL).toHaveBeenCalledWith('https://example.com/advising');
    });
  });

  it('alerts on invalid link', () => {
    global.alert = jest.fn(); // Mock alert
    const { getByText } = render(
      <AllServicesScreen route={{ params: { services: servicesMock } }} />
    );

    const serviceButton = getByText('Invalid Link');
    fireEvent.press(serviceButton);

    expect(global.alert).toHaveBeenCalledWith('Invalid link');
  });
});
