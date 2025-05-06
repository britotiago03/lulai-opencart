// src/components/dashboard/integrations/__tests__/BuildIntegration.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import BuildIntegration from '../BuildIntegration';

const mockFormData = {
    storeName: 'Test Store',
    platform: 'shopify',
    industry: 'fashion',
    customPrompt: 'Test prompt',
    apiKey: '1234-ABCD',
    productApiUrl: 'https://example.com/api/products'
};

describe('BuildIntegration', () => {
    it('renders Integration Summary correctly', () => {
        render(
            <BuildIntegration
                formData={mockFormData}
                buildingWidget={false}
                widgetBuilt={false}
                progress={[]}
                responseMsg=""
                downloadUrl={null}
                onBuild={jest.fn()}
            />
        );
        expect(screen.getByText('Store Name:')).toBeInTheDocument();
        expect(screen.getByText('Test Store')).toBeInTheDocument();
    });

    it('calls onBuild when Build button is clicked', () => {
        const onBuild = jest.fn();
        render(
            <BuildIntegration
                formData={mockFormData}
                buildingWidget={false}
                widgetBuilt={false}
                progress={[]}
                responseMsg=""
                downloadUrl={null}
                onBuild={onBuild}
            />
        );
        const buildButton = screen.getByRole('button', { name: /Build & Integrate/i });
        fireEvent.click(buildButton);
        expect(onBuild).toHaveBeenCalled();
    });

    it('disables button when widget is building or built', () => {
        const { rerender } = render(
            <BuildIntegration
                formData={mockFormData}
                buildingWidget={true}
                widgetBuilt={false}
                progress={[]}
                responseMsg=""
                downloadUrl={null}
                onBuild={jest.fn()}
            />
        );
        expect(screen.getByRole('button')).toBeDisabled();

        rerender(
            <BuildIntegration
                formData={mockFormData}
                buildingWidget={false}
                widgetBuilt={true}
                progress={[]}
                responseMsg=""
                downloadUrl={null}
                onBuild={jest.fn()}
            />
        );
        expect(screen.getByRole('button')).toBeDisabled();
    });
});
