// src/components/dashboard/__tests__/StatCards.test.tsx
import { render, screen } from '@testing-library/react';
import StatCards from '@/components/dashboard/StatCards';
import { DashboardStats } from '@/types/dashboard';

const mockStats: DashboardStats = {
    totalChatbots: 5,
    totalConversations: 200,
    conversionRate: 12.5,
    averageResponseTime: 3.2,
};

describe('StatCards', () => {
    it('renders all stat cards with correct values', () => {
        render(<StatCards stats={mockStats} />);
        expect(screen.getByText('Total Chatbots')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('Total Conversations')).toBeInTheDocument();
        expect(screen.getByText('200')).toBeInTheDocument();
        expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
        expect(screen.getByText('12.5%')).toBeInTheDocument();
        expect(screen.getByText('Avg. Response Time')).toBeInTheDocument();
        expect(screen.getByText('3.2s')).toBeInTheDocument();
    });
});
