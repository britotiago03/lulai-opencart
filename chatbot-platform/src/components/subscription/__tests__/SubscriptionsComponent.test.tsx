// src/components/subscription/__tests__/SubscriptionsComponent.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import SubscriptionsComponent from '../SubscriptionsComponent'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

jest.mock('next-auth/react', () => ({
    useSession: jest.fn()
}))

jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}))

describe('SubscriptionsComponent', () => {
    const replaceMock = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useRouter as jest.Mock).mockReturnValue({ replace: replaceMock })
    })

    it('shows loading spinner when auth status is loading', () => {
        ;(useSession as jest.Mock).mockReturnValue({ data: null, status: 'loading' })

        render(<SubscriptionsComponent />)
        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('redirects if user is not authenticated', async () => {
        ;(useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' })

        render(<SubscriptionsComponent />)

        await waitFor(() => {
            expect(replaceMock).toHaveBeenCalledWith('/auth/signin')
        })
    })

    it('renders subscription cards if authenticated', async () => {
        ;(useSession as jest.Mock).mockReturnValue({
            data: { user: { name: 'Test' } },
            status: 'authenticated'
        })

        render(<SubscriptionsComponent />)

        await waitFor(() => {
            expect(screen.getByText('Choose Your Plan')).toBeInTheDocument()
            expect(screen.getByText('Free')).toBeInTheDocument()
            expect(screen.getByText('Basic')).toBeInTheDocument()
            expect(screen.getByText('Pro')).toBeInTheDocument()
        })
    })
})
