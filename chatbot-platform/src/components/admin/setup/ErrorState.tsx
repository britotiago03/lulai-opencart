// src/components/admin/setup/ErrorState.tsx
import React from 'react';
import Link from 'next/link';

interface ErrorStateProps {
    error: string;
}

export function ErrorState({ error }: ErrorStateProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f1729] px-4">
            <div className="w-full max-w-md">
                <div className="bg-[#1b2539] rounded-lg shadow-xl p-8">
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                    <div className="text-center mt-4">
                        <Link href={`/admin/signin`} className="text-blue-500 hover:text-blue-400">
                            Back to Admin Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
