import '@testing-library/jest-dom';
jest.spyOn(console, 'log').mockImplementation(() => {});
// Mock ResizeObserver needed by recharts ResponsiveContainer
class ResizeObserver {
  constructor(callback) {}
  observe() {}
  unobserve() {}
  disconnect() {}
}
// Attach to global/window
global.ResizeObserver = ResizeObserver;

// Mock the api module so axios never gets imported
jest.mock('../api/api', () => ({
  api: { get: jest.fn() },
}));

// Mock BackButton util to avoid rendering navigation
jest.mock('../utils/navigationUtils', () => () => <div>BackButton</div>);

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Analytics from '../components/Analytics';
import { api } from '../api/api';

describe('Analytics Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders static and dynamic headers', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('numberOfLogins')) {
        return Promise.resolve({
          data: {
            today: { hourly: [{ hour: 12, count: 5 }] },
            week: { daily: [{ date: new Date().toISOString(), count: 10 }] },
            month: { daily: [{ date: new Date().toISOString(), count: 30 }] },
          },
        });
      }
      if (url.includes('numberOfActiveAccounts')) {
        return Promise.resolve({ data: { activeUsers: 50 } });
      }
      if (url.includes('numberOfInactiveAccounts')) {
        return Promise.resolve({ data: { inactiveUsers: 10 } });
      }
      return Promise.resolve({ data: {} });
    });

    render(<Analytics />);

    await waitFor(() =>
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
    );

    expect(screen.getByText('Total Active Accounts')).toBeInTheDocument();
    expect(screen.getByText('Number of Deactivated Accounts')).toBeInTheDocument();
    expect(screen.getByText(/Active Ratio/)).toBeInTheDocument();
  });

  test('toggles timeframe buttons correctly', async () => {
    api.get
      .mockResolvedValueOnce({
        data: {
          today: { hourly: [{ hour: 12, count: 5 }] },
          week: { daily: [{ date: new Date().toISOString(), count: 10 }] },
          month: { daily: [{ date: new Date().toISOString(), count: 30 }] },
        },
      })
      .mockResolvedValueOnce({ data: { activeUsers: 20 } })
      .mockResolvedValueOnce({ data: { inactiveUsers: 5 } });

    render(<Analytics />);

    await waitFor(() =>
      expect(screen.getByText(/Total Logins Today/)).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText('Past Week'));
    await waitFor(() =>
      expect(screen.getByText(/Total Logins This Week/)).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText('Past Month'));
    await waitFor(() =>
      expect(screen.getByText(/Total Logins This Month/)).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText('Today'));
    await waitFor(() =>
      expect(screen.getByText(/Total Logins Today/)).toBeInTheDocument()
    );
  });
});
