// src/components/home/__tests__/Header.test.tsx
import { render, screen } from '@/test-utils'
import { Header } from '../Header'

describe('Header', () => {
    it('renders brand name', () => {
        render(<Header />)
        expect(screen.getByText('LulAI')).toBeInTheDocument()
    })

    it('shows Sign In and Sign Up buttons when unauthenticated', () => {
        render(<Header />)
        expect(screen.getByText('Sign In')).toBeInTheDocument()
        expect(screen.getByText('Sign Up')).toBeInTheDocument()
    })

    it('renders ThemeToggle button', () => {
        render(<Header />)
        expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument()
    })
})
