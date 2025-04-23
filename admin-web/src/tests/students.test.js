import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Students from '../components/Students';
import { BrowserRouter } from 'react-router-dom';
import { api } from '../api/api';
import '@testing-library/jest-dom';

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

jest.mock('../api/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../utils/navigationUtils', () => () => <div>Back Button</div>);

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  sessionStorage.setItem('token', 'mock.token.payload');

  global.atob = (str) => JSON.stringify({ role: 'super-admin' });

  api.get.mockResolvedValue({
    data: [
      {
        std_id: 1,
        f_name: 'John',
        l_name: 'Doe',
        preferred_name: 'Johnny',
        expected_grad: 'Spring 2025',
        tags: 'Tag1, Tag2',
      },
    ],
  });
});

afterEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
});

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

test('renders student table and fetches data', async () => {
  renderWithRouter(<Students />);

  expect(await screen.findByText('Students')).toBeInTheDocument();

  expect(await screen.findByText('John')).toBeInTheDocument();
  expect(screen.getByText('Doe')).toBeInTheDocument();
  expect(screen.getByText('Johnny')).toBeInTheDocument();
  expect(screen.getByText('Spring 2025')).toBeInTheDocument();
});

test('toggle row expansion shows tags', async () => {
  renderWithRouter(<Students />);

  const toggleButton = await screen.findByText('▼');
  fireEvent.click(toggleButton);

  expect(await screen.findByText(/Tags:/)).toBeInTheDocument();
});

test('select and bulk delete students (open modal)', async () => {
  renderWithRouter(<Students />);

  await screen.findByText('Johnny');

  const checkbox = screen.getAllByRole('checkbox')[1]; // skip the select all
  fireEvent.click(checkbox);

  const deleteButton = screen.getByText('Delete Selected');
  fireEvent.click(deleteButton);

  expect(await screen.findByText('Confirm Bulk Deletion')).toBeInTheDocument();
});

test('search filters student list', async () => {
  renderWithRouter(<Students />);

  await screen.findByText('Johnny');

  const searchInput = screen.getByPlaceholderText('Search students...');
  fireEvent.change(searchInput, { target: { value: 'Jane' } });

  await waitFor(() => {
    expect(screen.queryByText('Johnny')).not.toBeInTheDocument();
  });
});
