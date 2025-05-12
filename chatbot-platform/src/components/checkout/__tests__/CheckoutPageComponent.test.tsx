import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CheckoutPageComponent from '@/components/checkout/CheckoutPageComponent';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Subscription } from '@/types/subscription';

// Mock the necessary hooks and components
jest.mock('next-auth/react', () => ({
    useSession: jest.fn()
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn()
}));

jest.mock('next/link', () => {
    // Using a named function to satisfy the ESLint display-name rule
    function NextLinkMock({ children, href }: { children: React.ReactNode, href: string }) {
        return <a href={href} data-testid="next-link">{children}</a>;
    }
    return NextLinkMock;
});

// Fix: Use the correct absolute path to the component from test file
jest.mock('@/components/checkout/CheckoutComponent', () => {
    // Using a named function to satisfy the ESLint display-name rule
    function MockCheckoutComponent({ selectedSubscription }: { selectedSubscription: Subscription | null }) {
        return (
            <div data-testid="checkout-component">
                {selectedSubscription
                    ? `Plan: ${selectedSubscription.plan_type}, Price: $${selectedSubscription.price}`
                    : 'No subscription'
                }
            </div>
        );
    }

    // Add __esModule flag to properly handle default exports

    return { __esModule: true, default: MockCheckoutComponent };
});

describe('CheckoutPageComponent', () => {
    const mockRouter = {
        push: jest.fn(),
        replace: jest.fn()
    };

    const mockGetValue = jest.fn();
    const mockSearchParams = {
        get: mockGetValue
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    });

    it('shows loading state when session is loading', () => {
        (useSession as jest.Mock).mockReturnValue({
            data: null,
            status: 'loading'
        });

        render(<CheckoutPageComponent />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('redirects to sign in page when not logged in', async () => {
        (useSession as jest.Mock).mockReturnValue({
            data: null,
            status: 'unauthenticated'
        });

        render(<CheckoutPageComponent />);

        await waitFor(() => {
            expect(mockRouter.replace).toHaveBeenCalledWith('/auth/signin');
        });
    });

    it('redirects to subscriptions page when no plan is selected', async () => {
        // Mock authenticated session
        (useSession as jest.Mock).mockReturnValue({
            data: { user: { name: 'Test User' } },
            status: 'authenticated'
        });

        // Mock search params with no values
        mockGetValue.mockImplementation(() => null);

        render(<CheckoutPageComponent />);

        await waitFor(() => {
            expect(mockRouter.replace).toHaveBeenCalledWith('/subscriptions');
        });
    });

    it('redirects to subscriptions page when invalid plan type is provided', async () => {
        // Mock authenticated session
        (useSession as jest.Mock).mockReturnValue({
            data: { user: { name: 'Test User' } },
            status: 'authenticated'
        });

        // Mock search params with invalid plan type
        mockGetValue.mockImplementation((key) => {
            if (key === 'price') return '29.99';
            if (key === 'type') return 'invalid_plan';
            return null;
        });

        render(<CheckoutPageComponent />);

        await waitFor(() => {
            expect(mockRouter.replace).toHaveBeenCalledWith('/subscriptions');
        });
    });

    it('renders checkout component with valid subscription data', async () => {
        // Mock authenticated session
        (useSession as jest.Mock).mockReturnValue({
            data: { user: { name: 'Test User' } },
            status: 'authenticated'
        });

        // Mock search params with valid values
        mockGetValue.mockImplementation((key) => {
            if (key === 'price') return '29.99';
            if (key === 'type') return 'pro';
            return null;
        });

        render(<CheckoutPageComponent />);

        await waitFor(() => {
            // Should render the main checkout component with subscription data
            expect(screen.getByTestId('checkout-component')).toHaveTextContent('Plan: pro, Price: $29.99');

            // Should render the page header
            expect(screen.getByText('Checkout')).toBeInTheDocument();

            // Should have a link back to plans
            expect(screen.getByText('← Back to plans')).toBeInTheDocument();

            // Should render the footer
            expect(screen.getByText(/LulAI Inc/)).toBeInTheDocument();
        });
    });

    // Update all the remaining tests with similar fixes...
    // (The remaining tests should be fine as they don't show errors in the test output)

    it('handles the current year in the footer', async () => {
        // Mock the Date object
        const originalDate = global.Date;
        const MockDateClass = class extends Date {
            getFullYear() {
                return 2025;
            }
        };

        // Type assertion to avoid TypeScript errors
        global.Date = MockDateClass as DateConstructor;

        // Mock authenticated session
        (useSession as jest.Mock).mockReturnValue({
            data: { user: { name: 'Test User' } },
            status: 'authenticated'
        });

        // Mock search params
        mockGetValue.mockImplementation((key) => {
            if (key === 'price') return '9.99';
            if (key === 'type') return 'basic';
            return null;
        });

        render(<CheckoutPageComponent />);

        await waitFor(() => {
            expect(screen.getByText(/LulAI Inc.*2025/)).toBeInTheDocument();
        });

        // Restore original Date
        global.Date = originalDate;
    });
});