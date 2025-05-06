// src/components/dashboard/__tests__/Sidebar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import * as nextAuth from 'next-auth/react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    usePathname: () => '/dashboard', // Return a valid pathname for tests
}));

// Mock next-auth
jest.mock('next-auth/react');

describe('Sidebar', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders navigation links', () => {
        render(<Sidebar />);
        expect(screen.getByText('Agents')).toBeInTheDocument();
        expect(screen.getByText('Analytics')).toBeInTheDocument();
        expect(screen.getByText('Conversations')).toBeInTheDocument();
    });

    it('calls signOut when Sign out button is clicked', () => {
        const signOutMock = jest.fn();
        jest.spyOn(nextAuth, 'signOut').mockImplementation(signOutMock);

        render(<Sidebar />);
        fireEvent.click(screen.getByText('Sign out'));

        expect(signOutMock).toHaveBeenCalled();
    });
});
