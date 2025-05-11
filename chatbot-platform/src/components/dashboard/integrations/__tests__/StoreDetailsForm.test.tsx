// src/components/dashboard/integrations/__tests__/StoreDetailsForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import StoreDetailsForm from '../StoreDetailsForm';

const mockProps = {
    formData: {
        storeName: 'Test Store',
        platform: 'shopify',
        industry: 'fashion',
        customPrompt: '',
        apiKey: '1234',
        productApiUrl: 'https://test.com/products'
    },
    errors: {
        storeName: '',
        productApiUrl: '',
        industry: '',
        apiKey: ''
    },
    onChange: jest.fn(),
    onGenerateApiKey: jest.fn()
};

describe('StoreDetailsForm', () => {
    it('renders all input fields and values', () => {
        render(<StoreDetailsForm {...mockProps} />);
        expect(screen.getByDisplayValue('Test Store')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1234')).toBeInTheDocument();
        expect(screen.getByDisplayValue('https://test.com/products')).toBeInTheDocument();
    });

    it('calls onChange when store name changes', () => {
        render(<StoreDetailsForm {...mockProps} />);
        const input = screen.getByDisplayValue('Test Store');
        fireEvent.change(input, { target: { value: 'New Store' } });
        expect(mockProps.onChange).toHaveBeenCalled();
    });

    it('calls onGenerateApiKey when button is clicked', () => {
        render(<StoreDetailsForm {...mockProps} />);
        fireEvent.click(screen.getByText('Generate API Key'));
        expect(mockProps.onGenerateApiKey).toHaveBeenCalled();
    });
});
