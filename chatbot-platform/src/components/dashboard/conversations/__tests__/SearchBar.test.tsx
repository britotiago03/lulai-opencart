// SearchBar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
    test('renders with provided search value', () => {
        render(<SearchBar search="test query" onChange={() => {}} />);

        const inputElement = screen.getByPlaceholderText('Search conversations...') as HTMLInputElement;
        expect(inputElement.value).toBe('test query');
    });

    test('calls onChange when input value changes', () => {
        const mockOnChange = jest.fn();
        render(<SearchBar search="" onChange={mockOnChange} />);

        const inputElement = screen.getByPlaceholderText('Search conversations...');
        fireEvent.change(inputElement, { target: { value: 'new search' } });

        expect(mockOnChange).toHaveBeenCalledWith('new search');
    });

    test('renders search icon', () => {
        render(<SearchBar search="" onChange={() => {}} />);

        // Check that search icon is rendered (using the parent container)
        const container = screen.getByPlaceholderText('Search conversations...').parentElement;
        const searchIcon = container?.querySelector('svg');
        expect(searchIcon).toBeInTheDocument();
    });
});