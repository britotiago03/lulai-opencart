// src/hooks/useTokenValidation.ts
"use client";

import { useState, useEffect } from 'react';

interface TokenValidationResult {
    isValidating: boolean;
    error: string;
    adminData: {
        name: string;
        email: string;
        token: string;
    };
}

export function useTokenValidation(token: string | null): TokenValidationResult {
    const [isValidating, setIsValidating] = useState(true);
    const [error, setError] = useState('');
    const [adminData, setAdminData] = useState({
        name: '',
        email: '',
        token: ''
    });

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing token. Please check your invitation email and try again.');
            setIsValidating(false);
            return;
        }

        const validateToken = async () => {
            try {
                console.log("Validating token:", token);

                const response = await fetch(`/api/admin-auth/validate-token?token=${token}`);
                const data = await response.json();

                console.log("Token validation response:", data);

                if (!response.ok) {
                    setError(data.message || 'Invalid token. This link may have expired.');
                    setIsValidating(false);
                    return;
                }

                setAdminData({
                    token,
                    name: data.name || '',
                    email: data.email || ''
                });
                setIsValidating(false);
            } catch (error) {
                console.error("Token validation error:", error);
                setError('Failed to validate your invitation. Please try again later.');
                setIsValidating(false);
            }
        };

        void validateToken();
    }, [token]);

    return {
        isValidating,
        error,
        adminData
    };
}