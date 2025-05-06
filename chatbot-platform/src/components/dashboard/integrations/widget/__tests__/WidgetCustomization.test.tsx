// src/components/dashboard/integrations/widget/__tests__/WidgetCustomization.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import type { WidgetConfig } from '@/types/integrations';
import type { WidgetCustomizationProps } from '../types';

// ✅ Inline mocks to avoid ReferenceError
jest.mock('../CustomizationForm', () => ({
    __esModule: true,
    default: () => <div data-testid="customization-form">CustomizationForm Mock</div>,
}));

jest.mock('../WidgetPreview', () => ({
    __esModule: true,
    default: () => <div data-testid="widget-preview">WidgetPreview Mock</div>,
}));

// ✅ Now safe to import after mocks
import WidgetCustomization from '../WidgetCustomization';

describe('WidgetCustomization', () => {
    const mockOnChange = jest.fn();
    const defaultWidgetConfig: WidgetConfig = {
        primaryColor: '#1E88E5',
        secondaryColor: '#4CAF50',
        buttonSize: '60',
        windowWidth: '350',
        windowHeight: '500',
        headerText: 'Chat with us',
        fontFamily: "'Roboto', sans-serif",
    };

    beforeEach(() => {
        mockOnChange.mockClear();
    });

    it('renders the title and description', () => {
        render(<WidgetCustomization widgetConfig={defaultWidgetConfig} onChange={mockOnChange} />);
        expect(screen.getByText('Step 4: Customize Widget')).toBeInTheDocument();
        expect(
            screen.getByText('Personalize your chatbot widget appearance and behavior.')
        ).toBeInTheDocument();
    });

    it('renders the CustomizationForm component', () => {
        render(<WidgetCustomization widgetConfig={defaultWidgetConfig} onChange={mockOnChange} />);
        expect(screen.getByTestId('customization-form')).toBeInTheDocument();
    });

    it('renders the WidgetPreview component', () => {
        render(<WidgetCustomization widgetConfig={defaultWidgetConfig} onChange={mockOnChange} />);
        expect(screen.getByTestId('widget-preview')).toBeInTheDocument();
    });

    it('renders the Card component with proper styling', () => {
        const { container } = render(
            <WidgetCustomization widgetConfig={defaultWidgetConfig} onChange={mockOnChange} />
        );
        const card = container.querySelector('.shadow-lg.mb-6.bg-\\[\\#1b2539\\].border-0');
        expect(card).toBeInTheDocument();
    });

    it('passes widgetConfig and onChange props to CustomizationForm', async () => {
        const CustomizationFormWithProps = (props: WidgetCustomizationProps) => (
            <div data-testid="customization-form-props">
                <span data-testid="config-primary-color">{props.widgetConfig.primaryColor}</span>
                <button
                    data-testid="mock-change-button"
                    onClick={() =>
                        props.onChange({
                            target: { value: 'test' },
                        } as React.ChangeEvent<HTMLInputElement>)
                    }
                >
                    Test onChange
                </button>
            </div>
        );

        jest.resetModules();
        jest.doMock('../CustomizationForm', () => ({
            __esModule: true,
            default: CustomizationFormWithProps,
        }));

        const { default: WidgetCustomizationWithMock } = await import('../WidgetCustomization');

        const { getByTestId } = render(
            <WidgetCustomizationWithMock
                widgetConfig={defaultWidgetConfig}
                onChange={mockOnChange}
            />
        );

        expect(getByTestId('config-primary-color').textContent).toBe('#1E88E5');
        fireEvent.click(getByTestId('mock-change-button'));
        expect(mockOnChange).toHaveBeenCalledTimes(1);
    });
});
