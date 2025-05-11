// src/components/dashboard/integrations/widget/WidgetPreview.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import WidgetPreview from '../WidgetPreview';
import { WidgetConfig } from '@/types/integrations';

describe('WidgetPreview', () => {
    const defaultWidgetConfig: WidgetConfig = {
        primaryColor: '#1E88E5',
        secondaryColor: '#4CAF50',
        buttonSize: '60',
        windowWidth: '350',
        windowHeight: '500',
        headerText: 'Chat with us',
        fontFamily: "'Roboto', sans-serif"
    };

    it('renders the widget preview with correct heading', () => {
        render(<WidgetPreview widgetConfig={defaultWidgetConfig} />);
        expect(screen.getByText('Widget Preview')).toBeInTheDocument();
    });

    it('renders chat window with header text from config', () => {
        render(<WidgetPreview widgetConfig={defaultWidgetConfig} />);
        expect(screen.getByText('Chat with us')).toBeInTheDocument();
    });

    it('renders chat messages preview', () => {
        render(<WidgetPreview widgetConfig={defaultWidgetConfig} />);
        expect(screen.getByText('How can I help you?')).toBeInTheDocument();
        expect(screen.getByText('Sample question')).toBeInTheDocument();
    });

    it('renders the chat window with correct dimensions based on config', () => {
        const { container } = render(<WidgetPreview widgetConfig={defaultWidgetConfig} />);

        // Find the chat window container
        const chatWindow = container.querySelector('.bg-\\[\\#2a3349\\]');
        expect(chatWindow).toHaveStyle({
            width: `${Number(defaultWidgetConfig.windowWidth) * 0.5}px`,
            height: `${Number(defaultWidgetConfig.windowHeight) * 0.5}px`
        });
    });

    it('renders the chat button with correct dimensions based on config', () => {
        const { container } = render(<WidgetPreview widgetConfig={defaultWidgetConfig} />);

        // Find the chat button
        const chatButton = container.querySelector('.absolute.right-4.bottom-4');
        expect(chatButton).toHaveStyle({
            backgroundColor: defaultWidgetConfig.primaryColor,
            width: `${Number(defaultWidgetConfig.buttonSize) * 0.7}px`,
            height: `${Number(defaultWidgetConfig.buttonSize) * 0.7}px`
        });
    });

    it('applies primary color to header and button', () => {
        const { container } = render(<WidgetPreview widgetConfig={defaultWidgetConfig} />);

        // Find header and check color
        const header = container.querySelector('.rounded-t-md');
        expect(header).toHaveStyle({
            backgroundColor: defaultWidgetConfig.primaryColor
        });

        // Find button and check color
        const button = container.querySelector('.absolute.right-4.bottom-4');
        expect(button).toHaveStyle({
            backgroundColor: defaultWidgetConfig.primaryColor
        });
    });

    it('applies secondary color to user chat bubble', () => {
        const { container } = render(<WidgetPreview widgetConfig={defaultWidgetConfig} />);

        // Find user message bubble
        const userBubble = container.querySelector('.flex.justify-end > div');
        expect(userBubble).toHaveStyle({
            backgroundColor: defaultWidgetConfig.secondaryColor
        });
    });

    it('renders with updated config when props change', () => {
        const updatedConfig = {
            ...defaultWidgetConfig,
            primaryColor: '#FF5733',
            headerText: 'New Header Text',
            buttonSize: '80'
        };

        const { rerender, container } = render(<WidgetPreview widgetConfig={defaultWidgetConfig} />);

        // Re-render with updated config
        rerender(<WidgetPreview widgetConfig={updatedConfig} />);

        // Check if header text updated
        expect(screen.getByText('New Header Text')).toBeInTheDocument();

        // Check if colors and dimensions updated
        const header = container.querySelector('.rounded-t-md');
        expect(header).toHaveStyle({
            backgroundColor: '#FF5733'
        });

        const chatButton = container.querySelector('.absolute.right-4.bottom-4');
        expect(chatButton).toHaveStyle({
            width: `${Number(updatedConfig.buttonSize) * 0.7}px`,
            height: `${Number(updatedConfig.buttonSize) * 0.7}px`
        });
    });
});