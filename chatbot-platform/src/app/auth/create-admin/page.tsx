// src/app/auth/create-admin/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function CreateAdmin() {
    const [name, setName] = useState('Admin User');
    const [email, setEmail] = useState('admin@lulai.com');
    const [password, setPassword] = useState('adminPassword123');
    const [token, setToken] = useState('create-admin-123456');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('/api/auth/create-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, token }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create admin');
            }

            setMessage(data.message);
        } catch (error: any) {
            setError(error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f1729] px-4">
            <div className="w-full max-w-md">
                <div className="bg-[#1b2539] rounded-lg shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">Create Admin User</h2>

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
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-[#2a3349] border border-gray-600 rounded-md text-white"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="token" className="block text-sm font-medium text-gray-300 mb-1">
                                Security Token
                            </label>
                            <input
                                id="token"
                                type="text"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                className="w-full px-3 py-2 bg-[#2a3349] border border-gray-600 rounded-md text-white"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200 flex justify-center"
                        >
                            {loading ? 'Creating...' : 'Create Admin User'}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <Link href="/auth/signin" className="text-blue-500 hover:text-blue-400">
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}