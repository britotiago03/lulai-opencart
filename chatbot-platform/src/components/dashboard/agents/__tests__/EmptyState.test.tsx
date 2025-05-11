import { render, screen } from '@testing-library/react';
import EmptyState from '@/components/dashboard/agents/EmptyState';

describe('EmptyState', () => {
    it('renders "no agents yet" when search is empty', () => {
        render(<EmptyState search="" />);

        expect(screen.getByText(/No agents yet/i)).toBeInTheDocument();
        expect(screen.getByText(/Create your first chatbot agent/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Create Your First Agent/i })).toBeInTheDocument();
    });

    it('renders "no agents found" when search is non-empty', () => {
        render(<EmptyState search="test" />);

        expect(screen.getByText(/No agents found matching your search/i)).toBeInTheDocument();
        expect(screen.getByText(/Try searching with different keywords/i)).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /Create Your First Agent/i })).not.toBeInTheDocument();
    });
});
