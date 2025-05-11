// ConversationStats.test.tsx
import { render, screen } from '@testing-library/react';
import ConversationStats from '../ConversationStats';
import { Message } from '@/app/dashboard/conversations/[id]/page';

describe('ConversationStats', () => {
    const mockMessages: Message[] = [
        { message_role: 'user', message_content: 'Hello', created_at: '2025-05-06T12:30:00Z', id: '1', user_id: 'user1', api_key: 'key1' },
        { message_role: 'assistant', message_content: 'Hi there', created_at: '2025-05-06T12:31:00Z', id: '2', user_id: 'user1', api_key: 'key1' },
        { message_role: 'user', message_content: 'How are you?', created_at: '2025-05-06T12:32:00Z', id: '3', user_id: 'user1', api_key: 'key1' },
        { message_role: 'assistant', message_content: 'I am fine', created_at: '2025-05-06T12:33:00Z', id: '4', user_id: 'user1', api_key: 'key1' },
    ];

    test('calculates message counts correctly', () => {
        render(<ConversationStats messages={mockMessages} />);

        // Check total messages count
        expect(screen.getByText('4')).toBeInTheDocument();

        // Check user messages count (should be 2)
        const userStat = screen.getByText('User Messages').nextElementSibling;
        expect(userStat?.textContent).toBe('2');

        // Check bot messages count (should be 2)
        const botStat = screen.getByText('Bot Messages').nextElementSibling;
        expect(botStat?.textContent).toBe('2');
    });

    test('renders with zero messages', () => {
        render(<ConversationStats messages={[]} />);

        // Check all counts are zero
        const totalStat = screen.getByText('Total Messages').nextElementSibling;
        expect(totalStat?.textContent).toBe('0');

        const userStat = screen.getByText('User Messages').nextElementSibling;
        expect(userStat?.textContent).toBe('0');

        const botStat = screen.getByText('Bot Messages').nextElementSibling;
        expect(botStat?.textContent).toBe('0');
    });
});
