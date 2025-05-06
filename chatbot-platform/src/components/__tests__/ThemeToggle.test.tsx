// src/components/ThemeToggle.test.tsx
import { render, screen, fireEvent } from '../../test-utils'
import { ThemeToggle } from '../ThemeToggle'
import '@testing-library/jest-dom'

describe('ThemeToggle', () => {
    it('renders without crashing', () => {
        render(<ThemeToggle />)
        expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument()
    })

    it('toggles theme when clicked', () => {
        render(<ThemeToggle />, { initialTheme: 'light' })

        // First it should show the moon icon (light mode)
        const toggleButton = screen.getByLabelText('Toggle theme')

        // Click to toggle
        fireEvent.click(toggleButton)

        // Find sun icon that appears after toggle
        expect(screen.getByText((_content, element) => {
            return element?.tagName.toLowerCase() === 'svg' && element?.classList.contains('text-yellow-500')
        })).toBeInTheDocument()
    })
})