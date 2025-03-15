"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function VerifyEmailChangePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your new email address...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided.');
            return;
        }

        const verifyEmailChange = async () => {
            try {
                const response = await fetch(`/api/auth/verify?token=${token}`);
                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage('Your email has been changed successfully! Please sign in again with your new email address.');

                    // Sign out the user after a delay
                    setTimeout(async () => {
                        await signOut({ redirect: false });
                        router.push('/auth/login');
                    }, 5000);
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Failed to verify email change. The link may be expired or invalid.');
                }
            } catch (error) {
                setStatus('error');
                setMessage('An error occurred while verifying your email change.');
                console.error(error);
            }
        };

        // Call the async function and handle any errors
        verifyEmailChange().catch(error => {
            console.error("Failed to verify email change:", error);
            setStatus('error');
            setMessage('An unexpected error occurred.');
        });
    }, [token, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Email Change Verification</h2>
                </div>

                <div className="mt-8">
                    {status === 'loading' && (
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-4 text-lg text-gray-600">{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <p className="mt-4 text-lg text-gray-600">{message}</p>
                            <p className="mt-2 text-sm text-gray-500">Redirecting to login page...</p>
                            <Link href={`/auth/login`} className="mt-4 inline-block text-blue-600 hover:text-blue-800">
                                Go to login now
                            </Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                                <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </div>
                            <p className="mt-4 text-lg text-gray-600">{message}</p>
                            <div className="mt-6 space-y-2">
                                <Link href={`/account/profile`} className="block text-blue-600 hover:text-blue-800">
                                    Back to profile
                                </Link>
                                <Link href={`/auth/login`} className="block text-blue-600 hover:text-blue-800">
                                    Go to login
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}