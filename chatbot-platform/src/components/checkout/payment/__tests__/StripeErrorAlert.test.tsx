import React from 'react';
import { render, screen } from '@testing-library/react';
import { StripeErrorAlert } from '@/components/checkout/payment/StripeErrorAlert';

// Mock the lucide-react component
jest.mock('lucide-react', () => ({
    AlertCircle: () => <div data-testid="alert-circle-icon" />
}));

describe('StripeErrorAlert', () => {
    it('renders the error message correctly', () => {
        const errorMessage = 'Your card was declined';
        render(<StripeErrorAlert message={errorMessage} />);

        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    });

    it('renders the component with the correct styles', () => {
        render(<StripeErrorAlert message="Test error" />);

        const alertDiv = screen.getByText('Test error').closest('div');
        expect(alertDiv).toHaveClass('bg-red-500/10');
        expect(alertDiv).toHaveClass('border-red-500/50');
        expect(alertDiv).toHaveClass('text-red-400');
    });
});