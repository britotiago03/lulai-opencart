import { render, screen } from '@testing-library/react';
import ErrorDisplay from '@/components/dashboard/ErrorDisplay';

describe('ErrorDisplay', () => {
    it('displays error message', () => {
        render(<ErrorDisplay error="Something went wrong" />);
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByText('Create New Chatbot')).toBeInTheDocument();
    });
});
