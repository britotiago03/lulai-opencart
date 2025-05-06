import { render, screen, fireEvent } from '@testing-library/react';
import IntentDistribution from '@/components/dashboard/analytics/IntentDistributionChart';
import { IntentItem } from '@/types/analytics';

// Mock the dynamic import of PieChart
jest.mock('next/dynamic', () => () =>
    // Return a component function directly without the redundant local variable
    function MockPieChart({ data }) {
        // This mock just renders a div with data-testid that we can check for
        return data && data.length > 0 ? (
            <div data-testid="pie-chart" />
        ) : (
            <div>No data available</div>
        );
    }
);

// Sample intent data for testing
const mockItems: IntentItem[] = [
    { intent: 'question', count: 50 },
    { intent: 'navigate', count: 30 },
    { intent: 'purchase', count: 20 },
    { intent: 'unknown', count: 10 } // Changed null to 'unknown' to match the IntentItem type
];

describe('IntentDistribution', () => {
    it('renders the component heading', () => {
        render(<IntentDistribution items={mockItems} />);
        expect(screen.getByText('Intent Distribution')).toBeInTheDocument();
    });

    it('renders the PieChart when items are provided', () => {
        render(<IntentDistribution items={mockItems} />);
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('renders no data message when items are empty array', () => {
        render(<IntentDistribution items={[]} />);
        expect(screen.getByText('No intent data available')).toBeInTheDocument();
    });

    it('renders no data message when items are undefined', () => {
        render(<IntentDistribution items={undefined} />);
        expect(screen.getByText('No intent data available')).toBeInTheDocument();
    });

    it('toggles detailed intent list when expand button is clicked', () => {
        render(<IntentDistribution items={mockItems} />);

        // Initially, the detailed list should not be visible
        expect(screen.queryByText('question')).not.toBeInTheDocument();

        // Click to expand
        fireEvent.click(screen.getByRole('button'));

        // Now the detailed list should be visible
        expect(screen.getByText('question')).toBeInTheDocument();
        expect(screen.getByText('navigate')).toBeInTheDocument();
        expect(screen.getByText('purchase')).toBeInTheDocument();
        expect(screen.getByText('unknown')).toBeInTheDocument();

        // Check counts are displayed
        expect(screen.getByText('50')).toBeInTheDocument();
        expect(screen.getByText('30')).toBeInTheDocument();
        expect(screen.getByText('20')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();

        // Click to collapse
        fireEvent.click(screen.getByRole('button'));

        // Detailed list should be hidden again
        expect(screen.queryByText('question')).not.toBeInTheDocument();
    });

    it('does not render detailed list when items are undefined', () => {
        render(<IntentDistribution items={undefined} />);

        // Click to expand
        fireEvent.click(screen.getByRole('button'));

        // No detailed list should be shown
        expect(screen.queryByText('question')).not.toBeInTheDocument();
    });
});