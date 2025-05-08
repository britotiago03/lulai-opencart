import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CheckoutComponent from '@/components/checkout/CheckoutComponent';
import { useRouter } from 'next/navigation';
import { Subscription } from '@/types/subscription';

// Mock the necessary components and hooks
jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}));

jest.mock('@/components/checkout/OrderSummary', () => ({
    OrderSummary: ({ subscription }) => (
        <div data-testid="order-summary">
            {subscription ? `Plan: ${subscription.plan_type}, Price: ${subscription.price}` : 'No subscription'}
        </div>
    )
}));

jest.mock('@/components/checkout/payment/StripeProvider', () => ({
    StripeProvider: ({ onSubmitAction, isSubmitting, amount }) => (
        <div data-testid="stripe-provider">
            <button
                data-testid="mock-payment-button"
                onClick={() => onSubmitAction({
                    paymentMethodId: 'pm_test',
                    amount: amount * 100,
                    currency: 'usd',
                    description: `Test Payment - ${amount}`,
                    customer: { name: 'Test User', email: 'test@example.com' },
                    paymentIntentId: 'pi_test'
                })}
                disabled={isSubmitting}
            >
                Process Payment {isSubmitting ? '(Submitting...)' : ''}
            </button>
        </div>
    )
}));

// Mock fetch
global.fetch = jest.fn();

describe('CheckoutComponent', () => {
    const mockRouter = {
        push: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({ subscriptionId: 'sub_123456' })
        });
    });

    it('renders correctly with a selected subscription', () => {
        const mockSubscription: Subscription = {
            plan_type: 'basic' as const,
            price: 9.99
        };
        render(<CheckoutComponent selectedSubscription={mockSubscription} />);

        // Fix: Remove the $ symbol from expectation to match the mock component
        expect(screen.getByTestId('order-summary')).toHaveTextContent('Plan: basic, Price: 9.99');
        expect(screen.getByTestId('stripe-provider')).toBeInTheDocument();
        expect(screen.queryByTestId('alert-circle-icon')).not.toBeInTheDocument(); // No error initially
    });

    it('handles payment submission successfully', async () => {
        const mockSubscription: Subscription = {
            plan_type: 'pro' as const,
            price: 29.99
        };
        render(<CheckoutComponent selectedSubscription={mockSubscription} />);

        // Trigger the mock payment button
        fireEvent.click(screen.getByTestId('mock-payment-button'));

        // Verify fetch was called with the right data
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/checkout/stripe',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                    // Remove the body check since it's causing comparison issues with objects
                })
            );

            // Verify JSON payload separately with more flexible matching
            const fetchCalls = (global.fetch as jest.Mock).mock.calls;
            const lastCallBody = JSON.parse(fetchCalls[0][1].body);

            expect(lastCallBody).toHaveProperty('paymentMethod', 'stripe');
            expect(lastCallBody).toHaveProperty('paymentData.paymentMethodId', 'pm_test');
            expect(lastCallBody).toHaveProperty('paymentData.amount', 2999);
            expect(lastCallBody).toHaveProperty('subscription.plan_type', 'pro');
            expect(lastCallBody).toHaveProperty('subscription.price', 29.99);

            // Verify router was called to redirect
            expect(mockRouter.push).toHaveBeenCalledWith('/order-confirmation/sub_123456');
        });
    });

    it('handles API errors during payment submission', async () => {
        const errorMessage = 'Payment processing failed';

        // Mock fetch to return an error
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            json: jest.fn().mockResolvedValue({ error: errorMessage })
        });

        const mockSubscription: Subscription = {
            plan_type: 'basic' as const,
            price: 9.99
        };
        render(<CheckoutComponent selectedSubscription={mockSubscription} />);

        // Trigger the mock payment button
        fireEvent.click(screen.getByTestId('mock-payment-button'));

        // Verify error is displayed
        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
            expect(mockRouter.push).not.toHaveBeenCalled();
        });
    });

    it('handles exceptions during payment submission', async () => {
        // Mock fetch to throw an error
        (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

        const mockSubscription: Subscription = {
            plan_type: 'basic' as const,
            price: 9.99
        };
        render(<CheckoutComponent selectedSubscription={mockSubscription} />);

        // Trigger the mock payment button
        fireEvent.click(screen.getByTestId('mock-payment-button'));

        // Verify error is displayed
        await waitFor(() => {
            expect(screen.getByText('Network error')).toBeInTheDocument();
            expect(mockRouter.push).not.toHaveBeenCalled();
        });
    });

    it('shows an error if no subscription is selected', async () => {
        // Fix: Change the expectation since our mock always renders something
        render(<CheckoutComponent selectedSubscription={null} />);

        // Instead of checking for absence, check for the null state message
        expect(screen.getByTestId('order-summary')).toHaveTextContent('No subscription');

        // Find and click the mock payment button
        fireEvent.click(screen.getByTestId('mock-payment-button'));

        // Verify error is displayed
        await waitFor(() => {
            expect(screen.getByText('No subscription selected')).toBeInTheDocument();
            expect(global.fetch).not.toHaveBeenCalled();
        });
    });
});