import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StripeElementsForm } from '@/components/checkout/payment/StripeElementsForm';
import * as stripeHooks from '@/hooks/useCreatePaymentIntent';
import { useStripe, useElements } from '@stripe/react-stripe-js';

// Mock the required hooks and components
jest.mock('@stripe/react-stripe-js', () => ({
    useStripe: jest.fn(),
    useElements: jest.fn(),
    PaymentElement: () => <div data-testid="payment-element">Payment Element</div>,
    AddressElement: () => <div data-testid="address-element">Address Element</div>
}));

jest.mock('@/hooks/useCreatePaymentIntent');
jest.mock('@/components/checkout/payment/StripeErrorAlert', () => ({
    StripeErrorAlert: ({ message }) => <div data-testid="stripe-error">{message}</div>
}));

describe('StripeElementsForm', () => {
    const mockOnSubmitAction = jest.fn();
    const mockAmount = 29.99;
    const defaultProps = {
        onSubmitAction: mockOnSubmitAction,
        isSubmitting: false,
        amount: mockAmount
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Default mock implementations
        (useStripe as jest.Mock).mockReturnValue({
            confirmPayment: jest.fn()
        });

        (useElements as jest.Mock).mockReturnValue({
            submit: jest.fn()
        });

        (stripeHooks.useCreatePaymentIntent as jest.Mock).mockReturnValue({
            clientSecret: 'test_client_secret',
            error: null
        });
    });

    it('renders the form correctly', () => {
        render(<StripeElementsForm {...defaultProps} />);

        expect(screen.getByLabelText(/cardholder name/i)).toBeInTheDocument();
        expect(screen.getByText(/card information/i)).toBeInTheDocument();
        expect(screen.getByText(/billing address/i)).toBeInTheDocument();
        expect(screen.getByText(`Pay $${mockAmount.toFixed(2)}/month`)).toBeInTheDocument();
        expect(screen.getByText(/securely processed by stripe/i)).toBeInTheDocument();
    });

    it('displays error alert when there is an intentError', () => {
        const intentError = 'Failed to create payment intent';
        (stripeHooks.useCreatePaymentIntent as jest.Mock).mockReturnValue({
            clientSecret: null,
            error: intentError
        });

        render(<StripeElementsForm {...defaultProps} />);

        expect(screen.getByTestId('stripe-error')).toHaveTextContent(intentError);
    });

    it('updates cardholderName when input changes', () => {
        render(<StripeElementsForm {...defaultProps} />);

        const nameInput = screen.getByLabelText(/cardholder name/i);
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });

        expect(nameInput).toHaveValue('John Doe');
    });

    it('disables the submit button when stripe is not available', () => {
        (useStripe as jest.Mock).mockReturnValue(null);

        render(<StripeElementsForm {...defaultProps} />);

        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('disables the submit button when clientSecret is not available', () => {
        (stripeHooks.useCreatePaymentIntent as jest.Mock).mockReturnValue({
            clientSecret: null,
            error: null
        });

        render(<StripeElementsForm {...defaultProps} />);

        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('disables the submit button when isSubmitting is true', () => {
        render(<StripeElementsForm {...defaultProps} isSubmitting={true} />);

        expect(screen.getByRole('button')).toBeDisabled();
        expect(screen.getByText(/processing/i)).toBeInTheDocument();
    });

    it('handles form submission successfully', async () => {
        const mockStripe = {
            confirmPayment: jest.fn().mockResolvedValue({
                paymentIntent: {
                    id: 'pi_123456',
                    payment_method: 'pm_123456',
                    amount: mockAmount * 100,
                    currency: 'usd'
                }
            })
        };

        const mockElements = {
            submit: jest.fn().mockResolvedValue({ error: null })
        };

        (useStripe as jest.Mock).mockReturnValue(mockStripe);
        (useElements as jest.Mock).mockReturnValue(mockElements);

        render(<StripeElementsForm {...defaultProps} />);

        // Fill in cardholder name
        fireEvent.change(screen.getByLabelText(/cardholder name/i), {
            target: { value: 'John Doe' }
        });

        // Submit the form
        fireEvent.submit(screen.getByRole('button').closest('form')!);

        await waitFor(() => {
            expect(mockElements.submit).toHaveBeenCalled();
            expect(mockStripe.confirmPayment).toHaveBeenCalledWith({
                elements: mockElements,
                clientSecret: 'test_client_secret',
                confirmParams: {
                    return_url: expect.any(String),
                },
                redirect: "if_required",
            });

            expect(mockOnSubmitAction).toHaveBeenCalledWith({
                paymentMethodId: 'pm_123456',
                amount: mockAmount * 100,
                currency: 'usd',
                description: `LulAI Subscription - $${mockAmount}/month`,
                customer: {
                    name: 'John Doe',
                    email: 'user@example.com',
                },
                paymentIntentId: 'pi_123456',
            });
        });
    });

    it('handles element submission error', async () => {
        const mockElements = {
            submit: jest.fn().mockResolvedValue({
                error: { message: 'Invalid card information' }
            })
        };

        (useElements as jest.Mock).mockReturnValue(mockElements);

        render(<StripeElementsForm {...defaultProps} />);

        // Submit the form
        fireEvent.submit(screen.getByRole('button').closest('form')!);

        await waitFor(() => {
            expect(mockElements.submit).toHaveBeenCalled();
            expect(screen.getByTestId('stripe-error')).toHaveTextContent('Invalid card information');
        });
    });

    it('handles payment confirmation error', async () => {
        const mockElements = {
            submit: jest.fn().mockResolvedValue({ error: null })
        };

        const mockStripe = {
            confirmPayment: jest.fn().mockResolvedValue({
                error: { message: 'Payment was declined' }
            })
        };

        (useElements as jest.Mock).mockReturnValue(mockElements);
        (useStripe as jest.Mock).mockReturnValue(mockStripe);

        render(<StripeElementsForm {...defaultProps} />);

        // Submit the form
        fireEvent.submit(screen.getByRole('button').closest('form')!);

        await waitFor(() => {
            expect(mockElements.submit).toHaveBeenCalled();
            expect(mockStripe.confirmPayment).toHaveBeenCalled();
            expect(screen.getByTestId('stripe-error')).toHaveTextContent('Payment was declined');
        });
    });

    it('handles unexpected errors during submission', async () => {
        const mockElements = {
            submit: jest.fn().mockResolvedValue({ error: null })
        };

        const mockStripe = {
            confirmPayment: jest.fn().mockRejectedValue(new Error('Network error'))
        };

        (useElements as jest.Mock).mockReturnValue(mockElements);
        (useStripe as jest.Mock).mockReturnValue(mockStripe);

        render(<StripeElementsForm {...defaultProps} />);

        // Submit the form
        fireEvent.submit(screen.getByRole('button').closest('form')!);

        await waitFor(() => {
            expect(screen.getByTestId('stripe-error')).toHaveTextContent('An unexpected error occurred during payment');
        });
    });
});