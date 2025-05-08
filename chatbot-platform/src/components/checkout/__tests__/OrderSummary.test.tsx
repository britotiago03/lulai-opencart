import React from 'react';
import { render, screen } from '@testing-library/react';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { Subscription } from '@/types/subscription';

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
    ShoppingBag: () => <div data-testid="shopping-bag-icon" />,
    Check: () => <div data-testid="check-icon" />
}));

describe('OrderSummary', () => {
    const basicSubscription: Subscription = {
        plan_type: 'basic' as const,
        price: 9.99
    };

    const proSubscription: Subscription = {
        plan_type: 'pro' as const,
        price: 29.99
    };

    it('renders null if no subscription is provided', () => {
        const { container } = render(<OrderSummary subscription={null} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders basic subscription details correctly', () => {
        render(<OrderSummary subscription={basicSubscription} />);

        // Check if plan name and price are displayed correctly
        expect(screen.getByText('Basic Plan')).toBeInTheDocument();

        // Fix: Use getAllByText instead of getByText for texts that appear multiple times
        // Also use a more specific selector to target just the first instance
        const priceElements = screen.getAllByText(/\$9\.99\/month/);
        expect(priceElements.length).toBeGreaterThan(0);
        expect(priceElements[0]).toBeInTheDocument();

        // Check for basic plan features
        expect(screen.getByText('Advanced Chatbot features')).toBeInTheDocument();
        expect(screen.getByText('Unlimited message history')).toBeInTheDocument();
        expect(screen.getByText('Increased interactions (1000/month)')).toBeInTheDocument();
        expect(screen.getByText('Detailed analytics')).toBeInTheDocument();
        expect(screen.getByText('Priority support')).toBeInTheDocument();
    });

    it('renders pro subscription details correctly', () => {
        render(<OrderSummary subscription={proSubscription} />);

        // Check if plan name and price are displayed correctly
        expect(screen.getByText('Pro Plan')).toBeInTheDocument();

        // Fix: Use getAllByText instead of getByText
        const priceElements = screen.getAllByText(/\$29\.99\/month/);
        expect(priceElements.length).toBeGreaterThan(0);
        expect(priceElements[0]).toBeInTheDocument();

        // Check for pro plan features
        expect(screen.getByText('All Basic features')).toBeInTheDocument();
        expect(screen.getByText('Unlimited interactions')).toBeInTheDocument();
        expect(screen.getByText('Advanced analytics & reporting')).toBeInTheDocument();
        expect(screen.getByText('Collaboration tools')).toBeInTheDocument();
        expect(screen.getByText('Multiple chatbots')).toBeInTheDocument();
        expect(screen.getByText('Enterprise-level support')).toBeInTheDocument();
        expect(screen.getByText('Custom integrations')).toBeInTheDocument();
    });

    it('displays the total price correctly', () => {
        render(<OrderSummary subscription={proSubscription} />);

        // Find the total section at the bottom
        const totalElements = screen.getAllByText(/\$29\.99\/month/);
        // Should be shown twice - once in the item list and once in the total
        expect(totalElements).toHaveLength(2);
    });

    it('renders the disclaimer text about billing', () => {
        render(<OrderSummary subscription={basicSubscription} />);

        expect(screen.getByText("You'll be billed monthly. Cancel anytime.")).toBeInTheDocument();
    });

    it('renders the correct number of features based on plan type', () => {
        // Basic plan should have 5 features
        const { rerender } = render(<OrderSummary subscription={basicSubscription} />);
        expect(screen.getAllByTestId('check-icon')).toHaveLength(5);

        // Pro plan should have 7 features
        rerender(<OrderSummary subscription={proSubscription} />);
        expect(screen.getAllByTestId('check-icon')).toHaveLength(7);
    });
});