// ChatBubble.test.tsx
import { render, screen } from '@testing-library/react';
import ChatBubble from '../ChatBubble';

describe('ChatBubble', () => {
    const mockTimestamp = '2025-05-06T12:30:00Z';

    test('renders user message correctly', () => {
        render(
            <ChatBubble
                role="user"
                content="Hello world"
                timestamp={mockTimestamp}
            />
        );

        // Check content is displayed
        expect(screen.getByText('Hello world')).toBeInTheDocument();

        // Check user icon is displayed (by checking parent element has the right class)
        const userIcon = screen.getByText('Hello world').parentElement?.querySelector('div > svg');
        expect(userIcon).toBeInTheDocument();

        // Check alignment classes for user messages (justify-end for the outer container)
        const container = screen.getByText('Hello world').closest('div[class*="flex justify-end"]');
        expect(container).toBeInTheDocument();

        // Check the background color class for user messages
        const messageContainer = screen.getByText('Hello world').parentElement;
        expect(messageContainer).toHaveClass('bg-blue-900/20');
    });

    test('renders assistant message correctly', () => {
        render(
            <ChatBubble
                role="assistant"
                content="I am an AI"
                timestamp={mockTimestamp}
            />
        );

        // Check content is displayed
        expect(screen.getByText('I am an AI')).toBeInTheDocument();

        // Check bot icon is displayed
        const botIcon = screen.getByText('I am an AI').parentElement?.querySelector('div > svg');
        expect(botIcon).toBeInTheDocument();

        // Check alignment classes for assistant messages (justify-start for the outer container)
        const container = screen.getByText('I am an AI').closest('div[class*="flex justify-start"]');
        expect(container).toBeInTheDocument();

        // Check the background color class for assistant messages
        const messageContainer = screen.getByText('I am an AI').parentElement;
        expect(messageContainer).toHaveClass('bg-[#232b3c]');
    });

    test('formats timestamp correctly', () => {
        // Mock the toLocaleTimeString method
        const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;
        Date.prototype.toLocaleTimeString = jest.fn(() => '12:30 PM');

        render(
            <ChatBubble
                role="user"
                content="Hello world"
                timestamp={mockTimestamp}
            />
        );

        expect(screen.getByText('12:30 PM')).toBeInTheDocument();

        // Restore the original method
        Date.prototype.toLocaleTimeString = originalToLocaleTimeString;
    });
});