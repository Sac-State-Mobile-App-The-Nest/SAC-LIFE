import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MainContent from '../components/MainContent';

describe('MainContent Component', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <MainContent />
            </MemoryRouter>
        );
    });

    test('renders the dashboard heading', () => {
        expect(screen.getByRole('heading', {
            name: /admin dashboard of the sac life mobile app/i
        })).toBeInTheDocument();
    });

    test('renders all four dashboard cards with correct text and links', () => {
        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(4);

        expect(screen.getByText('Students')).toBeInTheDocument();
        expect(screen.getByText('Manage and view student data')).toBeInTheDocument();
        expect(links[0]).toHaveAttribute('href', '/Students');

        expect(screen.getByText('Analytics')).toBeInTheDocument();
        expect(screen.getByText('Monitor analytics and performance')).toBeInTheDocument();
        expect(links[1]).toHaveAttribute('href', '/Analytics');

        expect(screen.getByText('Chatbot Logs')).toBeInTheDocument();
        expect(screen.getByText('Access chatbot interaction logs')).toBeInTheDocument();
        expect(links[2]).toHaveAttribute('href', '/Chatbotlogs');

        expect(screen.getByText('Admin Roles')).toBeInTheDocument();
        expect(screen.getByText('Access logs for admin roles')).toBeInTheDocument();
        expect(links[3]).toHaveAttribute('href', '/AdminRoles');
    });
});
