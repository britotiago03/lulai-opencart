"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import AdminSessionProvider from '@/components/admin/AdminSessionProvider';

function CreateAdminContent() {
    const [name, setName] = useState('Admin User');
    const [email, setEmail] = useState('admin@lulai.com');
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
            // Update to use the new admin-auth/invite endpoint
            const response = await fetch('/api/admin-auth/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, token }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Failed to send admin invitation');
                return;
            }

            setMessage('Invitation email sent successfully! The admin will need to click the link in the email to set their password.');
        } catch (error) {
            console.error("Setup completion error:", error);
            if (error instanceof Error) {
                setError(error.message || 'An error occurred');
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f1729] px-4">
            <div className="w-full max-w-md">
                <div className="bg-[#1b2539] rounded-lg shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">Invite Admin User</h2>

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
                            {loading ? 'Sending Invitation...' : 'Send Admin Invitation'}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <Link href={`/admin/dashboard`} className="text-blue-500 hover:text-blue-400">
                            Back to Admin Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CreateAdminPage() {
    return (
        <AdminSessionProvider>
            <CreateAdminContent />
        </AdminSessionProvider>
    );
}