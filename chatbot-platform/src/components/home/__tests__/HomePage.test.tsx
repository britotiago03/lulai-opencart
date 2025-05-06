import { render, screen } from '@/test-utils'
import { HomePage } from '../HomePage'

describe('HomePage', () => {
    it('renders HeroSection headline', () => {
        render(<HomePage />)
        expect(
            screen.getByText((_, element) =>
                element?.textContent === 'AI Chatbots for Modern E-commerce'
            )
        ).toBeInTheDocument()
    })

    it('renders CTASection content', () => {
        render(<HomePage />)
        expect(screen.getByText('Start Free Trial')).toBeInTheDocument()
    })

    it('renders all feature titles', () => {
        render(<HomePage />)
        expect(screen.getByText('Smart Conversations')).toBeInTheDocument()
        expect(screen.getByText('Product Catalog Integration')).toBeInTheDocument()
        expect(screen.getByText('Detailed Analytics')).toBeInTheDocument()
    })
})
