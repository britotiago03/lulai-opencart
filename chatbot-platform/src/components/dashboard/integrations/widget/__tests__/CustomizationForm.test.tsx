// src/components/dashboard/integrations/widget/__tests__/CustomizationForm.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import CustomizationForm from '../CustomizationForm';
import { WidgetConfig } from '@/types/integrations';

describe('CustomizationForm', () => {
    const mockOnChange = jest.fn();
    const defaultWidgetConfig: WidgetConfig = {
        primaryColor: '#1E88E5',
        secondaryColor: '#4CAF50',
        buttonSize: '60',
        windowWidth: '350',
        windowHeight: '500',
        headerText: 'Chat with us',
        fontFamily: "'Roboto', sans-serif"
    };

    beforeEach(() => {
        mockOnChange.mockClear();
    });

    it('renders all form fields with correct values', () => {
        render(<CustomizationForm widgetConfig={defaultWidgetConfig} onChange={mockOnChange} />);

        // Check field labels
        expect(screen.getByText('Primary Color')).toBeInTheDocument();
        expect(screen.getByText('Secondary Color')).toBeInTheDocument();
        expect(screen.getByText('Button Size (px)')).toBeInTheDocument();
        expect(screen.getByText('Window Width (px)')).toBeInTheDocument();
        expect(screen.getByText('Window Height (px)')).toBeInTheDocument();
        expect(screen.getByText('Header Text')).toBeInTheDocument();
        expect(screen.getByText('Font Family')).toBeInTheDocument();

        // Help text
        expect(screen.getByText('Used for header and buttons')).toBeInTheDocument();
        expect(screen.getByText('Used for chat bubbles')).toBeInTheDocument();

        // Text inputs by value
        expect(screen.getByDisplayValue('#1E88E5')).toBeInTheDocument(); // primaryColor
        expect(screen.getByDisplayValue('#4CAF50')).toBeInTheDocument(); // secondaryColor
        expect(screen.getByDisplayValue('Chat with us')).toBeInTheDocument(); // headerText

        // Number inputs
        expect(screen.getByDisplayValue('60')).toBeInTheDocument(); // buttonSize
        expect(screen.getByDisplayValue('350')).toBeInTheDocument(); // windowWidth
        expect(screen.getByDisplayValue('500')).toBeInTheDocument(); // windowHeight

        // Select input
        const fontSelect = screen.getByRole('combobox');
        expect(fontSelect).toHaveValue("'Roboto', sans-serif");
    });

    it('renders the grid layout correctly', () => {
        const { container } = render(
            <CustomizationForm widgetConfig={defaultWidgetConfig} onChange={mockOnChange} />
        );

        const gridContainer = container.firstChild as HTMLElement;
        expect(gridContainer).toHaveClass('grid');
        expect(gridContainer).toHaveClass('grid-cols-1');
        expect(gridContainer).toHaveClass('md:grid-cols-2');
        expect(gridContainer).toHaveClass('gap-6');
    });

    it('renders all font options in the select field', () => {
        render(<CustomizationForm widgetConfig={defaultWidgetConfig} onChange={mockOnChange} />);

        expect(screen.getByText('Helvetica')).toBeInTheDocument();
        expect(screen.getByText('Roboto')).toBeInTheDocument();
        expect(screen.getByText('Open Sans')).toBeInTheDocument();
        expect(screen.getByText('Lato')).toBeInTheDocument();
        expect(screen.getByText('Arial')).toBeInTheDocument();
    });
});
