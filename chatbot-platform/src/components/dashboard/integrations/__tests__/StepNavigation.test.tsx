// src/components/dashboard/integrations/__tests__/StepNavigation.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import StepNavigation from '../StepNavigation';

describe('StepNavigation', () => {
    it('calls onNext and onPrevious correctly', () => {
        const onNext = jest.fn();
        const onPrevious = jest.fn();

        render(
            <StepNavigation
                onNext={onNext}
                onPrevious={onPrevious}
                disableNext={false}
                disablePrevious={false}
                hideNextButton={false}
            />
        );

        fireEvent.click(screen.getByText('Next'));
        fireEvent.click(screen.getByText('Back'));

        expect(onNext).toHaveBeenCalled();
        expect(onPrevious).toHaveBeenCalled();
    });

    it('hides Next button when hideNextButton is true', () => {
        render(
            <StepNavigation
                onNext={() => {}}
                onPrevious={() => {}}
                disableNext={false}
                disablePrevious={false}
                hideNextButton={true}
            />
        );

        expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });
});
