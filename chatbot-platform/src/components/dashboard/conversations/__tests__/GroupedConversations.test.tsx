// GroupedConversations.test.tsx
import { render, screen } from '@testing-library/react';
import GroupedConversations from '../GroupedConversations';
import { Conversation } from '@/hooks/useConversations';
import React from "react";

// Mock the next/link component to avoid routing issues in tests
jest.mock('next/link', () =>
    function Link({ children, href }: { children: React.ReactNode; href: string }) {
        return <a href={href}>{children}</a>;
    }
);

describe('GroupedConversations', () => {
    // Create conversations on two different dates
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toLocaleDateString();
    const yesterdayStr = yesterday.toLocaleDateString();

    const mockConversations: Conversation[] = [
        {
            id: '1',
            threadId: 'thread1',
            user_id: 'user1',
            message_content: 'First conversation today',
            messageCount: 5,
            created_at: today.toISOString(),
            chatbot_name: 'Bot1',
            api_key: 'key1',
            message_role: 'user'
        },
        {
            id: '2',
            threadId: 'thread2',
            user_id: 'user1',
            message_content: 'Second conversation today',
            messageCount: 3,
            created_at: today.toISOString(),
            chatbot_name: undefined,
            api_key: 'key1',
            message_role: 'user'
        },
        {
            id: '3',
            threadId: 'thread3',
            user_id: 'user2',
            message_content: 'Conversation from yesterday',
            messageCount: 10,
            created_at: yesterday.toISOString(),
            chatbot_name: 'Bot2',
            api_key: 'key1',
            message_role: 'user'
        }
    ];

    test('groups conversations by date correctly', () => {
        render(<GroupedConversations conversations={mockConversations} />);

        // Check that we have two date headers
        expect(screen.getByText(todayStr)).toBeInTheDocument();
        expect(screen.getByText(yesterdayStr)).toBeInTheDocument();

        // Check that conversations are displayed
        expect(screen.getByText('First conversation today')).toBeInTheDocument();
        expect(screen.getByText('Second conversation today')).toBeInTheDocument();
        expect(screen.getByText('Conversation from yesterday')).toBeInTheDocument();

        // Check that today's group has 2 conversations
        const todayGroup = screen.getByText(todayStr).closest('div')?.nextElementSibling;
        expect(todayGroup?.children.length).toBe(2);

        // Check that yesterday's group has 1 conversation
        const yesterdayGroup = screen.getByText(yesterdayStr).closest('div')?.nextElementSibling;
        expect(yesterdayGroup?.children.length).toBe(1);
    });

    test('renders correctly with empty conversations array', () => {
        render(<GroupedConversations conversations={[]} />);

        // Check that no date headers are rendered
        expect(screen.queryByText(todayStr)).not.toBeInTheDocument();
        expect(screen.queryByText(yesterdayStr)).not.toBeInTheDocument();
    });
});
