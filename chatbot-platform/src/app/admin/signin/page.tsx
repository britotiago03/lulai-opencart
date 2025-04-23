"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import AdminSessionProvider from "@/components/admin/AdminSessionProvider";

function AdminSignInContent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Check if coming from setup
    const fromSetup = searchParams.get("from") === "setup";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("admin-credentials", {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setError("Invalid admin credentials");
                setIsLoading(false);
                return;
            }

            router.push("/admin");
            router.refresh();
        } catch {
            setError("An error occurred during sign in");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f1729] px-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <span className="text-3xl font-bold text-white">LulAI Admin</span>
                </div>
                <div className="bg-[#1b2539] rounded-lg shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">
                        Admin Sign in
                    </h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {/* Show success message when coming from setup */}
                    {fromSetup && (
                        <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded mb-4">
                            Admin account created successfully! Please sign in with your credentials.
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-300 mb-1"
                            >
                                Email address
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
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-300 mb-1"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-[#2a3349] border border-gray-600 rounded-md text-white"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200 flex justify-center"
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function AdminSignInPage() {
    return (
        <AdminSessionProvider>
            <AdminSignInContent />
        </AdminSessionProvider>
    );
}