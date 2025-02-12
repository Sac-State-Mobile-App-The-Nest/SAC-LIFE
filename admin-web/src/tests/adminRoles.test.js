import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; 
import AdminRoles from '../components/AdminRoles';
import React from 'react';

// Mock window.alert to prevent Jest errors
global.alert = jest.fn();

// Ensure `localStorage.getItem` is properly mocked
beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn((key) => {
        if (key === 'token') return 'fake-jwt-token'; // Mock token
        if (key === 'role') return 'super-admin'; // Make sure role is "super-admin"
        return null;
      }),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    },
    writable: true,
  });

  // Mock fetch API BEFORE rendering the component
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true, 
      json: () =>
        Promise.resolve([
          { id: 1, username: 'admin1', role: 'super-admin' },
          { id: 2, username: 'admin2', role: 'content-manager' },
        ]),
    })
  );
});

afterEach(() => {
  jest.restoreAllMocks(); // Restore mocks after each test
});

test('renders admin list from API', async () => {
  render(<AdminRoles />);

  //  Wait for the admin list to load properly
  await waitFor(() => expect(screen.getByText(/admin1/i)).toBeInTheDocument());

  expect(screen.getByText(/super-admin/i)).toBeInTheDocument();
  expect(screen.getByText(/admin2/i)).toBeInTheDocument();
  expect(screen.getByText(/content-manager/i)).toBeInTheDocument();
});

test('opens edit modal when clicking edit button', async () => {
    render(<AdminRoles />);
  
    // Wait for the admin list to load
    await waitFor(() => screen.getByText(/admin1/i));
  
    // Find and click the Edit button for "admin1"
    const editButtons = await screen.findAllByText(/edit/i);
    fireEvent.click(editButtons[0]);
  
    // Ensure the edit modal opens
    await waitFor(() => expect(screen.getByText(/edit admin/i)).toBeInTheDocument());
  
    // Ensure username field is pre-filled
    expect(screen.getByLabelText(/username:/i)).toHaveValue('admin1');
  
    // Ensure role field is pre-filled
    expect(screen.getByLabelText(/role:/i)).toHaveValue('super-admin');
});
  
test('updates admin when clicking save in edit modal', async () => {
    render(<AdminRoles />);
  
    // Wait for the admin list to load
    await waitFor(() => screen.getByText(/admin1/i));
    
    // Find and click the Edit button for "admin1"
    const editButtons = await screen.findAllByText(/edit/i);
    fireEvent.click(editButtons[0]);
    
    // Wait for modal to appear
    await waitFor(() => expect(screen.getByText(/edit admin/i)).toBeInTheDocument());
  
    // Change the role field
    const roleInput = screen.getByLabelText(/role:/i);
    fireEvent.change(roleInput, { target: { value: 'moderator' } });
  
    // Click Save button
    const saveButton = screen.getByText(/save/i);
    fireEvent.click(saveButton);
  
    // Ensure fetch was called to update admin
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/adminRoutes/1'),
      expect.objectContaining({ method: 'PUT' })
    ));
  
    // Ensure modal closes
    await waitFor(() => expect(screen.queryByText(/edit admin/i)).not.toBeInTheDocument());
  });