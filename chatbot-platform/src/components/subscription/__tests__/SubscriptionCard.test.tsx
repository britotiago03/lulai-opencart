// src/components/subscription/__tests__/SubscriptionCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@/test-utils'
import SubscriptionCard from '../SubscriptionCard'
import { useRouter } from 'next/navigation'

jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}))

describe('SubscriptionCard', () => {
    const pushMock = jest.fn()
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useRouter as jest.Mock).mockReturnValue({ push: pushMock })
    })

    it('renders title, description, and features', () => {
        render(
            <SubscriptionCard
                title="Free"
                description="Great for testing"
                price_desc="$0/month"
                price={0}
                type="free"
            />
        )

        expect(screen.getByText('Free')).toBeInTheDocument()
        expect(screen.getByText('Great for testing')).toBeInTheDocument()
        expect(screen.getByText('$0/month')).toBeInTheDocument()
        expect(screen.getByText('Basic Chatbot')).toBeInTheDocument()
    })

    it('submits free plan and redirects on success', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ success: true })
        })

        render(
            <SubscriptionCard
                title="Free"
                description="Test free plan"
                price_desc="$0/month"
                price={0}
                type="free"
            />
        )

        const button = screen.getByRole('button', { name: /get started/i })
        fireEvent.click(button)

        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
        expect(pushMock).toHaveBeenCalledWith('/dashboard')
    })

    it('shows error on failed subscription', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'Subscription failed' })
        })

        render(
            <SubscriptionCard
                title="Free"
                description="Test free plan"
                price_desc="$0/month"
                price={0}
                type="free"
            />
        )

        const button = screen.getByRole('button', { name: /get started/i })
        fireEvent.click(button)

        await waitFor(() => {
            expect(screen.getByText('Subscription failed')).toBeInTheDocument()
        })
    })

    it('redirects to checkout for paid plans', () => {
        render(
            <SubscriptionCard
                title="Pro"
                description="Full features"
                price_desc="$49/month"
                price={49}
                type="pro"
            />
        )

        const button = screen.getByRole('button', { name: /select plan/i })
        fireEvent.click(button)

        expect(pushMock).toHaveBeenCalledWith('/checkout?price=49&type=pro')
    })
})
