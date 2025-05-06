// src/components/dashboard/integrations/__tests__/FormStepper.test.tsx
import { render, screen } from '@testing-library/react';
import FormStepper from '../FormStepper';

describe('FormStepper', () => {
    const steps = ['Platform', 'Details', 'Prompt', 'Customize', 'Build'];

    it('renders all steps', () => {
        render(<FormStepper currentStep={3} steps={steps} />);
        steps.forEach(step => {
            expect(screen.getByText(step)).toBeInTheDocument();
        });
    });

    it('highlights active and completed steps', () => {
        render(<FormStepper currentStep={3} steps={steps} />);
        const activeStep = screen.getByText('Prompt');
        expect(activeStep).toHaveClass('text-blue-500');

        const completedStep = screen.getByText('Details');
        expect(completedStep).toHaveClass('text-white');
    });
});
