import { render, screen, fireEvent } from '@testing-library/react';
import NavigationActionsCard from '@/components/dashboard/analytics/NavigationActionsCard';
import '@testing-library/jest-dom';
import { NavAction } from '@/types/analytics';

// Mock the Lucide icons
jest.mock('lucide-react', () => ({
    ArrowRight: function ArrowRight() { return <div data-testid="arrow-right-icon" />; },
    ChevronDown: function ChevronDown() { return <div data-testid="chevron-down-icon" />; },
    ChevronUp: function ChevronUp() { return <div data-testid="chevron-up-icon" />; }
}));

describe('NavigationActionsCard', () => {
    const mockItems: NavAction[] = [
        { target: '/products', count: 100 },
        { target: '/about', count: 75 },
        { target: '/contact', count: 50 },
        { target: '/blog', count: 25 }
    ];

    test('renders correctly with data', () => {
        render(<NavigationActionsCard items={mockItems} />);

        // Check title
        expect(screen.getByText('Navigation Actions')).toBeInTheDocument();

        // Check if all items are rendered
        expect(screen.getByText('/products')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('/about')).toBeInTheDocument();
        expect(screen.getByText('75')).toBeInTheDocument();
    });

    test('expands when toggle button is clicked', () => {
        render(<NavigationActionsCard items={mockItems} />);

        // Find and click the expand button
        const expandButton = screen.getByTestId('chevron-down-icon').parentElement;
        if (expandButton) {
            fireEvent.click(expandButton);
        }

        // Now the expanded section should be visible with additional items
        const expandedItems = screen.getAllByText('/products');
        expect(expandedItems.length).toBeGreaterThan(1);

        // The up chevron should be visible
        expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument();
    });

    test('collapses when toggle button is clicked twice', () => {
        render(<NavigationActionsCard items={mockItems} />);

        // Find and click the expand button
        const expandButton = screen.getByTestId('chevron-down-icon').parentElement;
        if (expandButton) {
            fireEvent.click(expandButton);
        }

        // Now click it again to collapse
        const collapseButton = screen.getByTestId('chevron-up-icon').parentElement;
        if (collapseButton) {
            fireEvent.click(collapseButton);
        }

        // The down chevron should be visible again
        expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();

        // Expanded section should not be visible
        // Use className or attribute selector to avoid square bracket syntax issues
        const bgElements = document.querySelectorAll('[class*="bg-"]');
        const expandedItemsCount = Array.from(bgElements).filter(el =>
            el.textContent?.includes('/products') && el.className.includes('p-2')
        ).length;

        // Should be 0 expanded items
        expect(expandedItemsCount).toBe(0);
    });

    test('handles empty items array', () => {
        render(<NavigationActionsCard items={[]} />);

        // Should display "No navigation data" message
        expect(screen.getByText('No navigation data')).toBeInTheDocument();
    });

    test('returns null when items is undefined', () => {
        const { container } = render(<NavigationActionsCard items={undefined} />);

        // Component should render nothing
        expect(container.firstChild).toBeNull();
    });

    test('correctly calculates progress bar widths', () => {
        render(<NavigationActionsCard items={mockItems} />);

        // Find all progress bars
        const progressBars = document.querySelectorAll('.bg-blue-600');

        // First item (index 0) should have style width: 100%
        expect(progressBars[0]).toHaveAttribute('style', 'width: 100%;');

        // Second item (index 1) should have style width: 75%
        expect(progressBars[1]).toHaveAttribute('style', 'width: 75%;');

        // Third item (index 2) should have style width: 50%
        expect(progressBars[2]).toHaveAttribute('style', 'width: 50%;');

        // Fourth item (index 3) should have style width: 25%
        expect(progressBars[3]).toHaveAttribute('style', 'width: 25%;');
    });
});