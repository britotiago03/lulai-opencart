import { render, screen, fireEvent } from '@testing-library/react';
import CartOperationsCard from '@/components/dashboard/analytics/CartOperationsCard';
import { CartOpItem } from '@/types/analytics';

// Sample cart operation items for testing
const mockItems: CartOpItem[] = [
    { operation: 'add', count: 100 },
    { operation: 'remove', count: 50 },
    { operation: 'update', count: 25 }
];

describe('CartOperationsCard', () => {
    it('renders null when items are undefined', () => {
        const { container } = render(<CartOperationsCard items={undefined} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders cart operations heading', () => {
        render(<CartOperationsCard items={mockItems} />);
        expect(screen.getByText('Cart Operations')).toBeInTheDocument();
    });

    it('renders all cart operation items', () => {
        render(<CartOperationsCard items={mockItems} />);
        expect(screen.getByText('add')).toBeInTheDocument();
        expect(screen.getByText('remove')).toBeInTheDocument();
        expect(screen.getByText('update')).toBeInTheDocument();

        // Check count numbers are displayed
        // Using getAllByText since numbers may appear multiple times
        expect(screen.getAllByText('100').length).toBeGreaterThan(0);
        expect(screen.getAllByText('50').length).toBeGreaterThan(0);
        expect(screen.getAllByText('25').length).toBeGreaterThan(0);
    });

    it('renders no data message when items array is empty', () => {
        render(<CartOperationsCard items={[]} />);
        expect(screen.getByText('No cart operations data')).toBeInTheDocument();
    });

    it('toggles extended metrics section when expand button is clicked', () => {
        render(
            <CartOperationsCard
                items={mockItems}
                conversionRate={45.5}
                extendedMetrics={true}
            />
        );

        // Check extended metrics are not visible initially
        expect(screen.queryByText('Success Rate')).not.toBeInTheDocument();

        // Click to expand
        fireEvent.click(screen.getByRole('button'));

        // Check extended metrics are now visible
        expect(screen.getByText('Success Rate')).toBeInTheDocument();
        expect(screen.getByText('45.5%')).toBeInTheDocument();
        expect(screen.getByText('Cart Add Actions')).toBeInTheDocument();

        // Use getAllByText for elements that appear multiple times
        const hundredElements = screen.getAllByText('100');
        expect(hundredElements.length).toBeGreaterThan(0);

        // Click to collapse
        fireEvent.click(screen.getByRole('button'));

        // Check extended metrics are hidden again
        expect(screen.queryByText('Success Rate')).not.toBeInTheDocument();
    });

    it('does not show extended metrics section when extendedMetrics is false', () => {
        render(
            <CartOperationsCard
                items={mockItems}
                conversionRate={45.5}
                extendedMetrics={false}
            />
        );

        // Click to expand
        fireEvent.click(screen.getByRole('button'));

        // Check extended metrics are still not visible
        expect(screen.queryByText('Success Rate')).not.toBeInTheDocument();
    });
});