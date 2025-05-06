import { render, screen, waitFor } from '@testing-library/react';
import AgentsPage from '../page';
import { useSession } from 'next-auth/react';

// Mock useRouter if needed (optional depending on usage)
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Mock next-auth session
jest.mock('next-auth/react');

describe('AgentsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state when session is loading', () => {
        (useSession as jest.Mock).mockReturnValue({ status: 'loading' });

        render(<AgentsPage />);
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('renders empty state when no chatbots are found', async () => {
        (useSession as jest.Mock).mockReturnValue({ status: 'authenticated' });

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ([]),
        });

        render(<AgentsPage />);

        await waitFor(() => {
            expect(screen.getByText(/Create your first chatbot/i)).toBeInTheDocument();
        });
    });

    it('renders error message when fetch fails', async () => {
        (useSession as jest.Mock).mockReturnValue({ status: 'authenticated' });

        global.fetch = jest.fn().mockRejectedValue(new Error('Fetch failed'));

        render(<AgentsPage />);

        await waitFor(() => {
            expect(screen.getByText(/Failed to load chatbots/i)).toBeInTheDocument();
        });
    });
});
