// src/components/dashboard/integrations/__tests__/IntegrationForm.test.tsx
import { render, screen } from '@testing-library/react';
import IntegrationForm from '../IntegrationForm';
import * as hook from '@/hooks/useIntegrationForm';

jest.mock('@/hooks/useIntegrationForm');

const mockUseIntegrationForm = hook.useIntegrationForm as jest.Mock;

describe('IntegrationForm', () => {
    beforeEach(() => {
        mockUseIntegrationForm.mockReturnValue({
            step: 1,
            formData: {
                storeName: '',
                platform: '',
                industry: '',
                customPrompt: '',
                apiKey: '',
                productApiUrl: ''
            },
            widgetConfig: {},
            errors: {
                storeName: '',
                productApiUrl: '',
                industry: '',
                apiKey: ''
            },
            buildState: {
                buildingWidget: false,
                widgetBuilt: false,
                progress: [],
                responseMsg: '',
                downloadUrl: null
            },
            handleChange: jest.fn(),
            handleWidgetConfigChange: jest.fn(),
            handlePlatformSelect: jest.fn(),
            handleNext: jest.fn(),
            handlePrevious: jest.fn(),
            generateApiKey: jest.fn(),
            handleBuildWidget: jest.fn()
        });
    });

    it('renders Platform step when step is 1', () => {
        render(<IntegrationForm />);
        expect(screen.getByText(/Step 1: Select a Platform/i)).toBeInTheDocument();
    });
});
