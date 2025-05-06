import { render, screen, fireEvent } from '@testing-library/react';
import AgentSearchBar from '@/components/dashboard/agents/AgentSearchBar';

describe('AgentSearchBar', () => {
    it('renders input and handles change', () => {
        const onChange = jest.fn();

        render(<AgentSearchBar value="test" onChange={onChange} />);

        const input = screen.getByPlaceholderText(/Search agents/i);
        expect(input).toBeInTheDocument();
        expect((input as HTMLInputElement).value).toBe('test');

        fireEvent.change(input, { target: { value: 'new query' } });
        expect(onChange).toHaveBeenCalledWith('new query');
    });
});
