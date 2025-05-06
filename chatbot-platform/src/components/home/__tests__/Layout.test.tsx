// src/components/home/__tests__/Layout.test.tsx
import { render, screen } from '@/test-utils'
import { Layout } from '../Layout'

describe('Layout', () => {
    it('renders children correctly', () => {
        render(<Layout><div>Test Content</div></Layout>)
        expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('includes Header and Footer', () => {
        render(<Layout><div /></Layout>)
        expect(screen.getByText('LulAI')).toBeInTheDocument() // Header
        expect(screen.getByText(/© 2025 LulAI/)).toBeInTheDocument() // Footer
    })
})
