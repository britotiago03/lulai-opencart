// src/components/home/__tests__/FeaturesSection.test.tsx
import { render, screen } from '@/test-utils'
import { FeaturesSection } from '../FeaturesSection'

describe('FeaturesSection', () => {
    it('renders section title', () => {
        render(<FeaturesSection />)
        expect(screen.getByText('Powerful Features')).toBeInTheDocument()
    })

    it('renders all features', () => {
        render(<FeaturesSection />)

        expect(screen.getByText('Smart Conversations')).toBeInTheDocument()
        expect(screen.getByText('Product Catalog Integration')).toBeInTheDocument()
        expect(screen.getByText('Detailed Analytics')).toBeInTheDocument()
    })
})
