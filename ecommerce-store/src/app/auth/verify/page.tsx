"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const type = searchParams.get("type");

    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        async function verifyToken() {
            if (!token) {
                setError("No verification token found");
                setIsLoading(false);
                return;
            }

            try {
                // Make sure to pass along the type parameter
                const response = await fetch(`/api/auth/verify?token=${token}&type=${type || 'account'}`);
                const data = await response.json();

                if (response.ok) {
                    setMessage(data.message || "Your account has been verified successfully!");
                } else {
                    setError(data.error || "Verification failed");
                }
            } catch (error) {
                setError("An unexpected error occurred");
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }

        // Handle the returned promise properly
        void verifyToken();
        // Alternatively, you could use:
        // verifyToken().catch(error => console.error("Verification error:", error));
    }, [token, type]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center mb-6">
                {error ? "Verification Failed" : "Email Verification"}
            </h1>

            {message && (
                <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
                    <div className="flex items-center">
                        <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <p>{message}</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
                    <p>{error}</p>
                </div>
            )}

            <div className="flex flex-col gap-4">
                {error && (
                    <Link
                        href={`/auth/signup`}
                        className="w-full py-2 px-4 bg-blue-500 text-white text-center rounded hover:bg-blue-600 transition-colors"
                    >
                        Register again
                    </Link>
                )}

                <Link
                    href={`/auth/login`}
                    className={`w-full py-2 px-4 ${!error ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'} text-white text-center rounded transition-colors`}
                >
                    Go to login
                </Link>
            </div>
        </div>
    );
}