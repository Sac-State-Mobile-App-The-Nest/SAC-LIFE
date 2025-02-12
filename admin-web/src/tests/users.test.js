import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Users from '../components/Users';
import React from 'react';

// Mock window.alert to prevent Jest errors
global.alert = jest.fn();

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn((key) => {
        if (key === 'token') return 'fake-jwt-token';
        if (key === 'role') return 'super-admin';
        return null;
      }),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    },
    writable: true,
  });

  global.fetch = jest.fn((url, options) => {
    if (url.includes('/api/students') && (!options || options.method === 'GET')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            { std_id: 1, f_name: 'John', m_name: 'A', l_name: 'Doe', email: 'john@example.com' },
            { std_id: 2, f_name: 'Jane', m_name: 'B', l_name: 'Smith', email: 'jane@example.com' },
          ]),
      });
    }

    if (url.includes('/api/students/') && options.method === 'PUT') {
      return Promise.resolve({ ok: true });
    }

    if (url.includes('/api/adminRoutes/students/') && options.method === 'DELETE') {
      return Promise.resolve({ ok: true });
    }

    return Promise.reject(new Error(`Unexpected API call: ${url}`));
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders user list from API', async () => {
  render(<Users />);

  await waitFor(() => expect(screen.getByText(/John/i)).toBeInTheDocument());
  expect(screen.getByText(/Doe/i)).toBeInTheDocument();
  expect(screen.getByText(/Jane/i)).toBeInTheDocument();
  expect(screen.getByText(/Smith/i)).toBeInTheDocument();
});

test('opens edit modal when clicking edit button', async () => {
  render(<Users />);

  await waitFor(() => screen.getByText(/John/i));

  const editButtons = await screen.findAllByText(/edit/i);
  fireEvent.click(editButtons[0]);

  await waitFor(() => expect(screen.getByText(/edit student/i)).toBeInTheDocument());

  expect(screen.getByLabelText(/First Name:/i)).toHaveValue('John');
  expect(screen.getByLabelText(/Last Name:/i)).toHaveValue('Doe');
});

test('updates user when clicking save in edit modal', async () => {
  render(<Users />);

  await waitFor(() => screen.getByText(/John/i));
  
  const editButtons = await screen.findAllByText(/edit/i);
  fireEvent.click(editButtons[0]);
  
  await waitFor(() => expect(screen.getByText(/edit student/i)).toBeInTheDocument());

  const nameInput = screen.getByLabelText(/First Name:/i);
  fireEvent.change(nameInput, { target: { value: 'Jonathan' } });

  const saveButton = screen.getByText(/save/i);
  fireEvent.click(saveButton);

  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/students/1'),
    expect.objectContaining({ method: 'PUT' })
  ));

  await waitFor(() => expect(screen.queryByText(/edit student/i)).not.toBeInTheDocument());
});

test('deletes user when clicking delete button and confirming', async () => {
  render(<Users />);

  await waitFor(() => screen.getByText(/John/i));
  
  const deleteButtons = await screen.findAllByText(/delete/i);
  fireEvent.click(deleteButtons[0]);
  
  await waitFor(() => expect(screen.getByText(/confirm delete/i)).toBeInTheDocument());

  const passwordInput = screen.getByLabelText(/Enter your password:/i);
  fireEvent.change(passwordInput, { target: { value: 'password123' } });

  const confirmDeleteButton = screen.getByText(/confirm delete/i);
  fireEvent.click(confirmDeleteButton);

  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/adminRoutes/students/1'),
    expect.objectContaining({ method: 'DELETE' })
  ));
});
