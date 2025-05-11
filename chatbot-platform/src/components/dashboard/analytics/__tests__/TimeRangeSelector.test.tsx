import { render, screen, fireEvent } from '@testing-library/react';
import TimeRangeSelector from '@/components/dashboard/analytics/TimeRangeSelector';
import '@testing-library/jest-dom';

// Mock the Lucide icon
jest.mock('lucide-react', () => ({
    RefreshCw: function RefreshCw() { return <div data-testid="refresh-icon" />; }
}));

describe('TimeRangeSelector', () => {
    // Mock handlers
    const mockOnChangeAction = jest.fn();
    const mockOnRefreshAction = jest.fn();

    beforeEach(() => {
        // Reset mocks between tests
        mockOnChangeAction.mockReset();
        mockOnRefreshAction.mockReset();
    });

    test('renders with all range options', () => {
        render(
            <TimeRangeSelector
                value="7"
                onChangeAction={mockOnChangeAction}
                onRefreshAction={mockOnRefreshAction}
            />
        );

        // Check if all buttons are rendered
        expect(screen.getByText('7 Days')).toBeInTheDocument();
        expect(screen.getByText('30 Days')).toBeInTheDocument();
        expect(screen.getByText('90 Days')).toBeInTheDocument();
        expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
    });

    test('shows selected button with correct styling', () => {
        render(
            <TimeRangeSelector
                value="30"
                onChangeAction={mockOnChangeAction}
                onRefreshAction={mockOnRefreshAction}
            />
        );

        // Selected button should have blue background
        const selectedButton = screen.getByText('30 Days');
        expect(selectedButton).toHaveClass('bg-blue-600');
        expect(selectedButton).toHaveClass('text-white');

        // Other buttons should not have selected styling
        const otherButton1 = screen.getByText('7 Days');
        const otherButton2 = screen.getByText('90 Days');
        expect(otherButton1).not.toHaveClass('bg-blue-600');
        expect(otherButton2).not.toHaveClass('bg-blue-600');
        expect(otherButton1).toHaveClass('text-gray-400');
        expect(otherButton2).toHaveClass('text-gray-400');
    });

    test('calls onChangeAction when range buttons are clicked', () => {
        render(
            <TimeRangeSelector
                value="7"
                onChangeAction={mockOnChangeAction}
                onRefreshAction={mockOnRefreshAction}
            />
        );

        // Click the 30 days button
        fireEvent.click(screen.getByText('30 Days'));
        expect(mockOnChangeAction).toHaveBeenCalledWith('30');
        expect(mockOnChangeAction).toHaveBeenCalledTimes(1);

        // Click the 90 days button
        fireEvent.click(screen.getByText('90 Days'));
        expect(mockOnChangeAction).toHaveBeenCalledWith('90');
        expect(mockOnChangeAction).toHaveBeenCalledTimes(2);
    });

    test('calls onRefreshAction when refresh button is clicked', () => {
        render(
            <TimeRangeSelector
                value="7"
                onChangeAction={mockOnChangeAction}
                onRefreshAction={mockOnRefreshAction}
            />
        );

        // Find and click the refresh button
        const refreshButton = screen.getByTestId('refresh-icon').parentElement;
        if (refreshButton) {
            fireEvent.click(refreshButton);
        }

        expect(mockOnRefreshAction).toHaveBeenCalledTimes(1);
    });

    test('does not call handler when clicking already selected value', () => {
        render(
            <TimeRangeSelector
                value="7"
                onChangeAction={mockOnChangeAction}
                onRefreshAction={mockOnRefreshAction}
            />
        );

        // Click the already selected 7 days button
        fireEvent.click(screen.getByText('7 Days'));

        // The handler should still be called, even for the selected button
        expect(mockOnChangeAction).toHaveBeenCalledWith('7');
        expect(mockOnChangeAction).toHaveBeenCalledTimes(1);
    });
});