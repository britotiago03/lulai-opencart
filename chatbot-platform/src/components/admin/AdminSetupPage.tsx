"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AdminSetupPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [accessUrl, setAccessUrl] = useState("");
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
    const [success, setSuccess] = useState(false);

    // Validate the token when the component mounts
    useEffect(() => {
        let isMounted = true;

        // Explicitly handle the promise to appease linters
        (async function doValidateToken() {
            if (!token) {
                if (isMounted) {
                    setMessage({
                        text: "Invalid setup link. No token provided.",
                        type: "error"
                    });
                    setValidating(false);
                }
                return;
            }

            try {
                const response = await fetch(`/api/admin/validate-setup-token?token=${token}`);
                const data = await response.json();

                if (isMounted) {
                    if (response.ok && data.valid) {
                        setTokenValid(true);
                        if (data.accessUrl) {
                            setAccessUrl(data.accessUrl);
                        }
                    } else {
                        setMessage({
                            text: "This setup link has expired or is invalid.",
                            type: "error"
                        });
                    }
                    setValidating(false);
                }
            } catch (error) {
                if (isMounted) {
                    console.error("Error validating token:", error);
                    setMessage({
                        text: "An error occurred while validating your setup link.",
                        type: "error"
                    });
                    setValidating(false);
                }
            }
        })().catch(error => {
            if (isMounted) {
                console.error("Unexpected error in token validation:", error);
                setMessage({
                    text: "An error occurred while validating your setup link.",
                    type: "error"
                });
                setValidating(false);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        // Basic validation
        if (password.length < 10) {
            setMessage({
                text: "Password must be at least 10 characters long for admin accounts",
                type: "error"
            });
            return;
        }

        if (password !== confirmPassword) {
            setMessage({
                text: "Passwords do not match",
                type: "error"
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/admin/setup-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({
                    text: "Your admin password has been set successfully!",
                    type: "success"
                });
                setSuccess(true);
            } else {
                setMessage({
                    text: data.error || "Failed to set password",
                    type: "error"
                });
            }
        } catch (error) {
            console.error("Password setup error:", error);
            setMessage({
                text: "An unexpected error occurred",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-gray-800 p-10 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                        Admin Setup
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Set up your admin account password
                    </p>
                </div>

                {validating ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-white">Validating your setup link...</p>
                    </div>
                ) : (
                    <>
                        {message && (
                            <div
                                className={`p-4 rounded-md ${
                                    message.type === "success" ? "bg-green-800 text-green-100" : "bg-red-800 text-red-100"
                                }`}
                            >
                                {message.text}
                            </div>
                        )}

                        {tokenValid && !success && (
                            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                                <div className="rounded-md shadow-sm -space-y-px">
                                    <div>
                                        <label htmlFor="password" className="sr-only">
                                            Password
                                        </label>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                            placeholder="Password (min. 10 characters)"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="confirmPassword" className="sr-only">
                                            Confirm Password
                                        </label>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                            placeholder="Confirm Password"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <div className="text-sm text-gray-400">
                                        <p>Password must be at least 10 characters long for admin accounts.</p>
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                            loading ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                    >
                                        {loading ? "Setting up..." : "Set Admin Password"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {success && (
                            <div className="mt-6 text-center">
                                <p className="text-gray-300 mb-4">
                                    Your admin password has been set successfully. You can now access the admin dashboard.
                                </p>
                                {accessUrl && (
                                    <Link
                                        href={accessUrl}
                                        className="inline-block mt-2 text-blue-400 border border-blue-400 hover:bg-blue-400 hover:text-white px-4 py-2 rounded-md transition-colors"
                                    >
                                        Go to Admin Login
                                    </Link>
                                )}
                            </div>
                        )}

                        {!tokenValid && (
                            <div className="mt-6 text-center text-gray-300">
                                <p>
                                    Please contact the system administrator for a new setup link if you need access to the admin area.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}