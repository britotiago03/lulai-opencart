import { render, screen } from '@testing-library/react';
import ErrorState from '@/components/dashboard/agents/ErrorState';

describe('ErrorState', () => {
    it('renders error message and reload button', () => {
        render(<ErrorState message="Something went wrong" />);

        expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
    });
});
