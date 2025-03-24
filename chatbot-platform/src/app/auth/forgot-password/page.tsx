"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ text: data.message, type: "success" });
                setSubmitted(true);
            } else {
                setMessage({ text: data.error || "Failed to process your request", type: "error" });
            }
        } catch (error) {
            console.error("Forgot password error:", error);
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
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {submitted
                            ? "Check your email for a reset link"
                            : "Enter your email address and we'll send you a link to reset your password"}
                    </p>
                </div>

                {message && (
                    <div
                        className={`p-4 rounded-md ${
                            message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-600"
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                {!submitted ? (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="email@example.com"
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
                                {loading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setSubmitted(false);
                                setEmail("");
                                setMessage(null);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            Try another email
                        </button>
                    </div>
                )}

                <div className="mt-4 text-center">
                    <Link href={`/auth/signin`} className="text-sm text-blue-600 hover:text-blue-800">
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}