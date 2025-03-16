"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
    const [success, setSuccess] = useState(false);

    // Validate the token when the component mounts
    useEffect(() => {
        // Create a non-async function for useEffect
        const checkToken = () => {
            if (!token) {
                setMessage({ text: "Invalid reset link. Please request a new one.", type: "error" });
                setValidating(false);
                return;
            }

            // Move the async logic inside and properly handle it
            fetch(`/api/auth/validate-reset-token?token=${token}`)
                .then(response => response.json())
                .then(data => {
                    if (data.valid) {
                        setTokenValid(true);
                    } else {
                        setMessage({ text: "This reset link has expired or is invalid. Please request a new one.", type: "error" });
                    }
                })
                .catch(error => {
                    console.error("Token validation error:", error);
                    setMessage({ text: "An error occurred while validating your reset link.", type: "error" });
                })
                .finally(() => {
                    setValidating(false);
                });
        };

        checkToken();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        // Basic validation
        if (newPassword.length < 8) {
            setMessage({ text: "Password must be at least 8 characters long", type: "error" });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ text: "Passwords do not match", type: "error" });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ text: data.message || "Your password has been reset successfully!", type: "success" });
                setSuccess(true);
                // Redirect to login page after a delay
                setTimeout(() => {
                    router.push("/auth/login");
                }, 3000);
            } else {
                setMessage({ text: data.error || "Failed to reset password", type: "error" });
            }
        } catch (error) {
            console.error("Password reset error:", error);
            setMessage({ text: "An unexpected error occurred", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Reset Your Password
                    </h2>
                </div>

                {validating ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                        <p>Validating your reset link...</p>
                    </div>
                ) : (
                    <>
                        {message && (
                            <div
                                className={`p-4 rounded-md ${
                                    message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-600"
                                }`}
                            >
                                {message.text}
                            </div>
                        )}

                        {tokenValid && !success && (
                            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                        New Password
                                    </label>
                                    <input
                                        id="newPassword"
                                        name="newPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                        placeholder="New password"
                                        disabled={loading}
                                        minLength={8}
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Must be at least 8 characters long
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                        Confirm New Password
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                        placeholder="Confirm new password"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                            loading ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                    >
                                        {loading ? "Resetting Password..." : "Reset Password"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {(!tokenValid || success) && (
                            <div className="mt-6 flex flex-col items-center justify-center">
                                <Link
                                    href={`/auth/login`}
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Back to Login
                                </Link>
                                {!tokenValid && !success && (
                                    <Link
                                        href={`/auth/forgot-password`}
                                        className="mt-2 text-blue-600 hover:text-blue-800"
                                    >
                                        Request a new reset link
                                    </Link>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}