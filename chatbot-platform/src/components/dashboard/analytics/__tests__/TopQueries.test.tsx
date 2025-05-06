import { render, screen } from '@testing-library/react';
import TopQueries from '@/components/dashboard/analytics/TopQueries';
import '@testing-library/jest-dom';

describe('TopQueries', () => {
    const mockQueries = [
        { message_content: 'How to reset my password?', count: 45 },
        { message_content: 'What are your business hours?', count: 32 },
        { message_content: 'Do you offer free shipping?', count: 28 },
        { message_content: 'How do I return an item?', count: 19 }
    ];

    test('renders correctly with data', () => {
        render(<TopQueries list={mockQueries} />);

        // Check title
        expect(screen.getByText('Top User Queries')).toBeInTheDocument();

        // Check if all queries are rendered
        expect(screen.getByText('How to reset my password?')).toBeInTheDocument();
        expect(screen.getByText('What are your business hours?')).toBeInTheDocument();
        expect(screen.getByText('Do you offer free shipping?')).toBeInTheDocument();
        expect(screen.getByText('How do I return an item?')).toBeInTheDocument();

        // Check if all counts are rendered
        expect(screen.getByText('45')).toBeInTheDocument();
        expect(screen.getByText('32')).toBeInTheDocument();
        expect(screen.getByText('28')).toBeInTheDocument();
        expect(screen.getByText('19')).toBeInTheDocument();
    });

    test('renders message when no data is available', () => {
        render(<TopQueries list={[]} />);

        // Check for the no data message
        expect(screen.getByText('No query data available')).toBeInTheDocument();
    });

    test('renders message when data is undefined', () => {
        render(<TopQueries list={undefined} />);

        // Check for the no data message
        expect(screen.getByText('No query data available')).toBeInTheDocument();
    });

    test('handles long query text with truncation', () => {
        const longQueries = [
            {
                message_content: 'This is a very long query that should be truncated because it exceeds the maximum width available in the component',
                count: 12
            }
        ];

        render(<TopQueries list={longQueries} />);

        // Check if the long query is rendered
        const queryElement = screen.getByText('This is a very long query that should be truncated because it exceeds the maximum width available in the component');
        expect(queryElement).toBeInTheDocument();

        // Check for truncate class
        expect(queryElement).toHaveClass('truncate');
        expect(queryElement).toHaveClass('max-w-[80%]');
    });

    test('renders badges with correct styling', () => {
        render(<TopQueries list={mockQueries} />);

        // Get the first count badge
        const countBadge = screen.getByText('45');

        // Check styling classes
        expect(countBadge).toHaveClass('bg-blue-900/30');
        expect(countBadge).toHaveClass('text-blue-400');
        expect(countBadge).toHaveClass('px-2');
        expect(countBadge).toHaveClass('py-1');
        expect(countBadge).toHaveClass('rounded-full');
        expect(countBadge).toHaveClass('text-xs');
    });
});