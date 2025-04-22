// src/app/auth/admin-setup/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AdminSetup() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [token, setToken] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [validatingToken, setValidatingToken] = useState(true);

    useEffect(() => {
        // Get token from URL
        const urlToken = searchParams.get('token');
        if (!urlToken) {
            setError('Invalid or missing token. Please check your invitation email and try again.');
            setValidatingToken(false);
            return;
        }

        // Validate token and get admin info
        const validateToken = async () => {
            try {
                const response = await fetch(`/api/auth/validate-admin-token?token=${urlToken}`);
                const data = await response.json();

                if (!response.ok) {
                    setError(data.message || 'Invalid token. This link may have expired.');
                    setValidatingToken(false);
                    return;
                }

                // Set the admin details from the token validation
                setToken(urlToken);
                setName(data.name || '');
                setEmail(data.email || '');
                setValidatingToken(false);
            } catch (error) {
                console.error("Token validation error:", error);
                setError('Failed to validate your invitation. Please try again later.');
                setValidatingToken(false);
            }
        };

        void validateToken();
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('/api/auth/complete-admin-setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    token
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Failed to complete admin setup');
                setLoading(false);
                return;
            }

            setMessage('Admin account created successfully! Redirecting to login...');

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push('/auth/signin');
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

    if (validatingToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f1729] px-4">
                <div className="w-full max-w-md text-center">
                    <div className="animate-spin text-blue-500 text-4xl mb-4">⟳</div>
                    <p className="text-white">Validating your invitation...</p>
                </div>
            </div>
        );
    }

    if (error && !name && !email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f1729] px-4">
                <div className="w-full max-w-md">
                    <div className="bg-[#1b2539] rounded-lg shadow-xl p-8">
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                        <div className="text-center mt-4">
                            <Link href={`/auth/signin`} className="text-blue-500 hover:text-blue-400">
                                Back to Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f1729] px-4">
            <div className="w-full max-w-md">
                <div className="bg-[#1b2539] rounded-lg shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">Complete Admin Setup</h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded mb-4">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                                Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 bg-[#2a3349] border border-gray-600 rounded-md text-white"
                                required
                                readOnly
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 bg-[#2a3349] border border-gray-600 rounded-md text-white"
                                required
                                readOnly
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                                Create Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-[#2a3349] border border-gray-600 rounded-md text-white"
                                required
                                placeholder="Minimum 8 characters"
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-[#2a3349] border border-gray-600 rounded-md text-white"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200 flex justify-center"
                        >
                            {loading ? 'Creating Account...' : 'Complete Admin Setup'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}