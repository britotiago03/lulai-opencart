'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/header';
import AgentCustomization from '@/components/agent-customization';
import { getSessionData } from '@/utils/session';

const CompletionPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('sessionId');

    useEffect(() => {
        // Verify the session exists
        if (!sessionId) {
            setError('Invalid session. Please try again.');
            setIsLoading(false);
            return;
        }

        const sessionData = getSessionData(sessionId);
        if (!sessionData) {
            setError('Session data not found. Please try again.');
            setIsLoading(false);
            return;
        }

        setIsLoading(false);
    }, [sessionId]);

    if (isLoading) {
        return (
            <>
                <Header />
                <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-black via-gray-600 to-black px-4 py-16 text-white">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
                    <p className="mt-4 text-xl">Loading...</p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-black via-gray-600 to-black px-4 py-16 text-white">
                    <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 max-w-lg text-center">
                        <h2 className="text-xl font-bold mb-2">Error</h2>
                        <p>{error}</p>
                        <button
                            onClick={() => router.push('/service')}
                            className="mt-4 px-4 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-black via-gray-600 to-black px-4 py-16 text-white">
                <h1 className="text-4xl font-bold mb-8 text-center">
                    Your AI Agent is Ready!
                </h1>
                <p className="text-lg mb-10 text-center max-w-2xl">
                    Your data has been successfully processed and your AI agent is ready to use.
                    You can now customize your agent before proceeding.
                </p>

                {sessionId && <AgentCustomization sessionId={sessionId} />}

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-400">
                        Want to skip customization?{' '}
                        <button
                            onClick={() => router.push(`/ai-agent?sessionId=${sessionId}`)}
                            className="text-blue-400 hover:underline"
                        >
                            Go straight to your AI agent
                        </button>
                    </p>
                </div>
            </div>
        </>
    );
};

export default CompletionPage;