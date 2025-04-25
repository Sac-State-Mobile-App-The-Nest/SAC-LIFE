import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LogIn from '../components/LogIn';
import { api } from '../api/api';

// Silence console.error in tests (e.g., login failures)
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock the api module so axios never loads
jest.mock('../api/api', () => ({
  api: { post: jest.fn() },
}));

describe('LogIn Component', () => {
  let setIsAuthenticated;

  beforeEach(() => {
    setIsAuthenticated = jest.fn();
    jest.clearAllMocks();

    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  test('successful login stores tokens, sets auth, and navigates', async () => {
    api.post.mockResolvedValue({
      data: { token: 'abc', refreshToken: 'def' },
    });

    render(<LogIn setIsAuthenticated={setIsAuthenticated} />);

    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'user' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'pass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    // button disabled and shows loading text
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveTextContent('Logging in...');

    await waitFor(() => {
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith('token', 'abc');
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith('refreshToken', 'def');
      expect(setIsAuthenticated).toHaveBeenCalledWith(true);
      expect(mockNavigate).toHaveBeenCalledWith('/');
      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

  test('login failure shows error message', async () => {
    api.post.mockRejectedValue(new Error('fail'));

    render(<LogIn setIsAuthenticated={setIsAuthenticated} />);

    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'user' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'pass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
      expect(setIsAuthenticated).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('no tokens in response shows appropriate error', async () => {
    api.post.mockResolvedValue({ data: {} });

    render(<LogIn setIsAuthenticated={setIsAuthenticated} />);

    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'user' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'pass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText('Login successful, but no token received.')).toBeInTheDocument();
      expect(setIsAuthenticated).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
