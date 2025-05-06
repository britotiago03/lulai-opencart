// src/components/ThemeProvider.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../ThemeProvider'

// Test component that uses the useTheme hook
const TestComponent = () => {
    const { theme, setTheme } = useTheme()

    return (
        <div>
            <span data-testid="current-theme">{theme}</span>
            <button onClick={() => setTheme('dark')} data-testid="set-dark">Set Dark</button>
            <button onClick={() => setTheme('light')} data-testid="set-light">Set Light</button>
        </div>
    )
}

describe('ThemeProvider', () => {
    it('provides the default theme', () => {
        render(
            <ThemeProvider defaultTheme="light">
                <TestComponent />
            </ThemeProvider>
        )

        expect(screen.getByTestId('current-theme').textContent).toBe('light')
    })

    it('allows changing the theme', () => {
        render(
            <ThemeProvider defaultTheme="light">
                <TestComponent />
            </ThemeProvider>
        )

        // Initial theme is light
        expect(screen.getByTestId('current-theme').textContent).toBe('light')

        // Change to dark
        fireEvent.click(screen.getByTestId('set-dark'))

        // Theme should be updated
        expect(screen.getByTestId('current-theme').textContent).toBe('dark')
    })

    it('stores theme in localStorage', () => {
        // Mock localStorage
        const localStorageMock = (() => {
            let store = {}
            return {
                getItem: jest.fn((key) => store[key] || null),
                setItem: jest.fn((key, value) => {
                    store[key] = value.toString()
                }),
                clear: jest.fn(() => {
                    store = {}
                })
            }
        })()

        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock
        })

        render(
            <ThemeProvider defaultTheme="light" storageKey="test-theme">
                <TestComponent />
            </ThemeProvider>
        )

        // Change to dark
        fireEvent.click(screen.getByTestId('set-dark'))

        // Check if localStorage was called with the right arguments
        expect(localStorageMock.setItem).toHaveBeenCalledWith('test-theme', 'dark')
    })
})