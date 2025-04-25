// src/components/admin/setup/SetupForm.tsx
import React, { useState } from 'react';
import { MessageAlert } from './MessageAlert';

interface SetupFormProps {
    name: string;
    email: string;
    token: string;
    loading: boolean;
    error: string;
    message: string;
    onSubmit: (data: { name: string; email: string; password: string; token: string }) => Promise<void>;
}

export function SetupForm({ name, email, token, loading, error, message, onSubmit }: SetupFormProps) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [validationError, setValidationError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Reset validation error
        setValidationError('');

        // Basic validation
        if (password !== confirmPassword) {
            setValidationError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setValidationError('Password must be at least 8 characters long');
            return;
        }

        await onSubmit({ name, email, password, token });
    };

    const displayError = validationError || error;

    return (
        <div className="bg-[#1b2539] rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Complete Admin Setup</h2>

            {displayError && <MessageAlert type="error" message={displayError} />}
            {message && <MessageAlert type="success" message={message} />}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        className="w-full px-3 py-2 bg-[#2a3349] border border-gray-600 rounded-md text-white"
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
                        className="w-full px-3 py-2 bg-[#2a3349] border border-gray-600 rounded-md text-white"
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
    );
}