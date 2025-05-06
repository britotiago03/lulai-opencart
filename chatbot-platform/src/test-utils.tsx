// src/test-utils.tsx
import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '@/components/ThemeProvider'
import '@testing-library/jest-dom'

const AllTheProviders = ({ children, initialTheme = 'light' }: { children: React.ReactNode, initialTheme?: 'light' | 'dark' | 'system' }) => {
    return (
        <ThemeProvider defaultTheme={initialTheme}>
            {children}
        </ThemeProvider>
    )
}

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'> & { initialTheme?: 'light' | 'dark' | 'system' }
) => {
    const { initialTheme, ...renderOptions } = options || {}
    return render(ui, {
        wrapper: (props) => AllTheProviders({ ...props, initialTheme }),
        ...renderOptions
    })
}

export * from '@testing-library/react'
export { customRender as render }