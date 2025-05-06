// src/components/dashboard/integrations/widget/__tests__/FormFields.test.tsx

import React, { useState, ReactNode } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColorField, NumberField, TextField, SelectField } from '../FormFields';

type ControlledWrapperProps<T> = {
    initialValue: T;
    children: (value: T, setValue: React.Dispatch<React.SetStateAction<T>>) => ReactNode;
};

function ControlledWrapper<T>({ initialValue, children }: ControlledWrapperProps<T>) {
    const [value, setValue] = useState<T>(initialValue);
    return <>{children(value, setValue)}</>;
}

describe('ColorField', () => {
    it('calls onChange when text input changes', () => {
        render(
            <ControlledWrapper initialValue="#FF5733">
                {(value, setValue) => (
                    <ColorField
                        label="Test Color"
                        name="testColor"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                )}
            </ControlledWrapper>
        );

        const input = screen.getByDisplayValue('#FF5733');
        fireEvent.change(input, { target: { value: '#00FF00' } });

        expect(screen.getByDisplayValue('#00FF00')).toBeInTheDocument();
    });
});

describe('NumberField', () => {
    it('calls onChange when value changes', () => {
        render(
            <ControlledWrapper initialValue="50">
                {(value, setValue) => (
                    <NumberField
                        label="Test Number"
                        name="testNumber"
                        min="0"
                        max="100"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                )}
            </ControlledWrapper>
        );

        const input = screen.getByDisplayValue('50');
        fireEvent.change(input, { target: { value: '75' } });

        expect(screen.getByDisplayValue('75')).toBeInTheDocument();
    });
});

describe('TextField', () => {
    it('calls onChange when value changes', () => {
        render(
            <ControlledWrapper initialValue="Test Value">
                {(value, setValue) => (
                    <TextField
                        label="Test Field"
                        name="testField"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                )}
            </ControlledWrapper>
        );

        const input = screen.getByDisplayValue('Test Value');
        fireEvent.change(input, { target: { value: 'New Value' } });

        expect(screen.getByDisplayValue('New Value')).toBeInTheDocument();
    });
});

describe('SelectField', () => {
    const options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
    ];

    it('calls onChange when selection changes', () => {
        render(
            <ControlledWrapper initialValue="option2">
                {(value, setValue) => (
                    <SelectField
                        label="Test Select"
                        name="testSelect"
                        value={value}
                        options={options}
                        onChange={(e) => setValue(e.target.value)}
                    />
                )}
            </ControlledWrapper>
        );

        const selectInput = screen.getByRole('combobox');
        fireEvent.change(selectInput, { target: { value: 'option3' } });

        expect(selectInput).toHaveValue('option3');
    });
});
