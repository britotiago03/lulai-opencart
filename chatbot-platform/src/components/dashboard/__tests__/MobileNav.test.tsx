// src/components/dashboard/__tests__/MobileNav.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileNav } from '@/components/dashboard/MobileNav';

describe('MobileNav', () => {
    it('shows menu icon when isOpen is false', () => {
        const toggleMock = jest.fn();
        render(<MobileNav isOpen={false} toggleAction={toggleMock} />);
        expect(screen.getByTestId('icon-menu')).toBeInTheDocument();
    });

    it('shows close icon when isOpen is true', () => {
        const toggleMock = jest.fn();
        render(<MobileNav isOpen={true} toggleAction={toggleMock} />);
        expect(screen.getByTestId('icon-x')).toBeInTheDocument();
    });

    it('calls toggleAction on click', () => {
        const toggleMock = jest.fn();
        render(<MobileNav isOpen={false} toggleAction={toggleMock} />);
        fireEvent.click(screen.getByRole('button', { name: /toggle menu/i }));
        expect(toggleMock).toHaveBeenCalled();
    });
});
