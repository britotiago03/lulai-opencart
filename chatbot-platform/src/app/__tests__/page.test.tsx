// src/app/page.test.tsx
import { render, screen } from '../../test-utils'
import Page from '../page'

// Mock the Layout and HomePage components
jest.mock('@/components/home/Layout', () => ({
    Layout: ({ children }) => <div data-testid="layout">{children}</div>
}))

jest.mock('@/components/home/HomePage', () => ({
    HomePage: () => <div data-testid="home-page">HomePage Content</div>
}))

describe('Page', () => {
    it('renders the HomePage within Layout', () => {
        render(<Page />)

        const layout = screen.getByTestId('layout')
        expect(layout).toBeInTheDocument()

        const homePage = screen.getByTestId('home-page')
        expect(homePage).toBeInTheDocument()
        expect(layout).toContainElement(homePage)
    })
})