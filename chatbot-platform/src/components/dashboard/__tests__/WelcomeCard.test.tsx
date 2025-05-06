// src/components/dashboard/__tests__/WelcomeCard.test.tsx
import { render, screen } from '@testing-library/react';
import WelcomeCard from '@/components/dashboard/WelcomeCard';

describe('WelcomeCard', () => {
    it('renders welcome message and create button when no chatbot', () => {
        render(<WelcomeCard userName="Tiago" hasChatbots={false} />);
        expect(screen.getByText('Welcome back, Tiago')).toBeInTheDocument();
        expect(screen.getByText('Create Your First Chatbot')).toBeInTheDocument();
    });

    it('renders manage button when chatbot exists', () => {
        render(<WelcomeCard userName="Tiago" hasChatbots={true} />);
        expect(screen.getByText('Manage Chatbot')).toBeInTheDocument();
    });
});
