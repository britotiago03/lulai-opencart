// src/components/dashboard/__tests__/ToDashboardButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import ToDashboardButton from '@/components/dashboard/ToDashboardButton';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

describe('ToDashboardButton', () => {
    it('navigates to /dashboard when clicked', () => {
        const pushMock = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

        render(<ToDashboardButton />);
        fireEvent.click(screen.getByRole('button'));
        expect(pushMock).toHaveBeenCalledWith('/dashboard');
    });
});
