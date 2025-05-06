// src/components/dashboard/integrations/__tests__/PlatformSelection.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import PlatformSelection from '../PlatformSelection';

describe('PlatformSelection', () => {
    it('calls onPlatformSelect with correct value', () => {
        const onSelect = jest.fn();
        render(<PlatformSelection onPlatformSelect={onSelect} />);

        fireEvent.click(screen.getByText('Shopify'));
        expect(onSelect).toHaveBeenCalledWith('shopify');

        fireEvent.click(screen.getByText('OpenCart'));
        expect(onSelect).toHaveBeenCalledWith('opencart');

        fireEvent.click(screen.getByText('Custom Store'));
        expect(onSelect).toHaveBeenCalledWith('customstore');
    });
});
