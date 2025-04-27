// src/hooks/useAdminSetup.ts
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminSetupData {
    name: string;
    email: string;
    password: string;
    token: string;
}

interface UseAdminSetupResult {
    loading: boolean;
    error: string;
    message: string;
    handleSubmit: (data: AdminSetupData) => Promise<void>;
}

export function useAdminSetup(): UseAdminSetupResult {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (data: AdminSetupData) => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            console.log("Submitting admin setup with token:", data.token);

            const response = await fetch('/api/admin-auth/complete-setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();
            console.log("Setup completion response:", responseData);

            if (!response.ok) {
                setError(responseData.message || 'Failed to complete admin setup');
                setLoading(false);
                return;
            }

            setMessage('Admin account created successfully! Redirecting to admin login...');

            setTimeout(() => {
                router.push('/admin/signin?from=setup');
            }, 2000);

        } catch (error) {
            console.error("Setup completion error:", error);
            if (error instanceof Error) {
                setError(error.message || 'An error occurred');
            } else {
                setError('An unexpected error occurred');
            }
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        message,
        handleSubmit
    };
}
