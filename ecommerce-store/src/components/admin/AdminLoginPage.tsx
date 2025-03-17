"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AdminLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const accessKey = searchParams.get("key");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [verifyingAccess, setVerifyingAccess] = useState(true);
    const [accessVerified, setAccessVerified] = useState(false);

    // Verify access key on component mount
    useEffect(() => {
        let isMounted = true;

        // Explicitly handle the promise to appease linters
        (async function doVerifyAccess() {
            if (!accessKey) {
                // If no access key, show 404
                router.replace("/404");
                return;
            }

            try {
                const response = await fetch("/api/admin/verify-access", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        accessKey,
                        path: window.location.pathname
                    }),
                });

                // Only update state if component is still mounted
                if (isMounted) {
                    if (!response.ok) {
                        // If invalid access, redirect to 404
                        router.replace("/404");
                        return;
                    }

                    // Access is verified
                    setAccessVerified(true);
                    setVerifyingAccess(false);
                }
            } catch (error) {
                // Only update state if component is still mounted
                if (isMounted) {
                    console.error("Error verifying access:", error);
                    router.replace("/404");
                    setVerifyingAccess(false);
                }
            }
        })().catch(error => {
            // Catch any unexpected errors from the IIFE
            if (isMounted) {
                console.error("Unexpected error in verification:", error);
                router.replace("/404");
                setVerifyingAccess(false);
            }
        });

        // Cleanup function to prevent state updates after unmount
        return () => {
            isMounted = false;
        };
    }, [accessKey, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("admin-credentials", {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setError("Invalid email or password");
            } else {
                // Redirect to admin dashboard
                router.push("/admin");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Show loading state while verifying access
    if (verifyingAccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // If access is not verified, this would normally redirect to 404,
    // but as a fallback, show a minimal loading screen
    if (!accessVerified) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-white">Checking access...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-gray-800 p-10 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                        Admin Login
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Access the administration dashboard
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-900 border border-red-800 text-white px-4 py-3 rounded">
                            {error}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}