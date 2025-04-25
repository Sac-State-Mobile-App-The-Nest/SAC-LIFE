import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatbotLogs from '../components/Chatbotlogs';
import { BrowserRouter } from 'react-router-dom';
import { api, logoutAdmin, refreshAccessToken } from '../api/api';
import '@testing-library/jest-dom';

// Mocking React Router future flag warnings
beforeAll(() => {
    jest.spyOn(console, 'warn').mockImplementation((message) => {
      if (
        message.includes('React Router Future Flag Warning') ||
        message.includes('Relative route resolution within Splat routes is changing')
      ) {
        // Ignore React Router future warnings
        return;
      }
      // Otherwise, call the original console.warn
      console.warn(message);
    });
  });

// Mock the api module
jest.mock('../api/api', () => ({
  api: {
    get: jest.fn(),
    delete: jest.fn(),
  },
  logoutAdmin: jest.fn(),
  refreshAccessToken: jest.fn(),
}));

// Mock the back button
jest.mock('../utils/navigationUtils', () => () => <div>Back Button</div>);

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Helper to render with router
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

beforeEach(() => {
  // Mock a valid token in session storage
  sessionStorage.setItem('token', 'mock.token.payload');

  // Mock atob decoding of JWT
  global.atob = () => JSON.stringify({ role: 'super-admin' });

  // Mock chatbot logs fetch
  api.get.mockResolvedValue({
    data: [
      {
        id: 1,
        username: 'test_user',
        student_question: 'What is AI?',
        bot_response: 'Artificial Intelligence is...',
        timestamp: new Date().toISOString(),
      },
    ],
  });
});

afterEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
});

test('renders chatbot logs and fetches data', async () => {
  renderWithRouter(<ChatbotLogs />);

  expect(await screen.findByText('Chatbot Logs')).toBeInTheDocument();

  // Make sure log content is visible
  expect(await screen.findByText('User: test_user')).toBeInTheDocument();
  expect(screen.getByText(/Artificial Intelligence/)).toBeInTheDocument();
});

test('filters logs using search bar', async () => {
  renderWithRouter(<ChatbotLogs />);

  await screen.findByText('User: test_user');

  const searchInput = screen.getByPlaceholderText('Search by username or question...');
  fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

  await waitFor(() => {
    expect(screen.queryByText('test_user')).not.toBeInTheDocument();
  });
});

test('deletes a log when delete button is clicked', async () => {
  api.delete.mockResolvedValue({});

  renderWithRouter(<ChatbotLogs />);

  const deleteBtn = await screen.findByText('Delete');
  fireEvent.click(deleteBtn);

  await waitFor(() => {
    expect(api.delete).toHaveBeenCalledWith(
      '/adminRoutes/chatbot-logs/1',
      expect.objectContaining({
        headers: { Authorization: expect.stringContaining('Bearer') },
      })
    );
  });
});
