// src/components/dashboard/__tests__/ChatbotSection.test.tsx
import { render, screen } from '@testing-library/react';
import ChatbotSection from '@/components/dashboard/ChatbotSection';
import { Chatbot } from '@/types/dashboard';

const mockChatbots: Chatbot[] = [
    {
        id: '1',
        name: 'RetailBot',
        industry: 'Retail',
        description: 'Helps customers',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'user123'
    }
];

describe('ChatbotSection', () => {
    it('renders chatbot list when chatbots are provided', () => {
        render(<ChatbotSection chatbots={mockChatbots} />);
        expect(screen.getByText('Your Chatbot')).toBeInTheDocument();
        expect(screen.getByText('RetailBot')).toBeInTheDocument();
    });

    it('renders empty state when no chatbots', () => {
        render(<ChatbotSection chatbots={[]} />);
        expect(screen.getByText('No Chatbots Yet')).toBeInTheDocument();
        expect(screen.getByText('Create Your First Chatbot')).toBeInTheDocument();
    });
});
