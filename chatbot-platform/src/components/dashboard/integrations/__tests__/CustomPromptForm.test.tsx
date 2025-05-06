// src/components/dashboard/integrations/__tests__/CustomPromptForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import CustomPromptForm from '../CustomPromptForm';

describe('CustomPromptForm', () => {
    it('renders textarea and displays prompt value', () => {
        render(
            <CustomPromptForm customPrompt="Hello world" onChange={() => {}} />
        );
        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveValue('Hello world');
    });

    it('calls onChange when text changes', () => {
        const onChange = jest.fn();
        render(<CustomPromptForm customPrompt="" onChange={onChange} />);
        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: 'New prompt' }
        });
        expect(onChange).toHaveBeenCalled();
    });
});
