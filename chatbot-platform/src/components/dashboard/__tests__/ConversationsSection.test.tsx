// src/components/dashboard/__tests__/ConversationsSection.test.tsx
import { render, screen } from '@testing-library/react';
import ConversationsSection from '@/components/dashboard/ConversationsSection';
import { Conversation } from '@/types/dashboard';

const mockConversations: Conversation[] = [
    {
        id: '1',
        chatbot_name: 'RetailBot',
        message_content: 'Hi, how can I help you?',
        user_id: 'user123',
        created_at: new Date().toISOString(),
        api_key: 'abc123',
        message_role: 'user'
    }
];

describe('ConversationsSection', () => {
    it('renders conversation list when conversations exist', () => {
        render(<ConversationsSection conversations={mockConversations} showEmptyState={true} />);
        expect(screen.getByText('Recent Conversations')).toBeInTheDocument();
        expect(screen.getByText('RetailBot')).toBeInTheDocument();
    });

    it('renders empty state when no conversations and showEmptyState is true', () => {
        render(<ConversationsSection conversations={[]} showEmptyState={true} />);
        expect(screen.getByText('No Conversations Yet')).toBeInTheDocument();
    });

    it('renders nothing when no conversations and showEmptyState is false', () => {
        const { container } = render(<ConversationsSection conversations={[]} showEmptyState={false} />);
        expect(container).toBeEmptyDOMElement();
    });
});
