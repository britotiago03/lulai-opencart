"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [unverifiedEmail, setUnverifiedEmail] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setUnverifiedEmail("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                // Check if it's an email verification error
                if (result.error === "EMAIL_NOT_VERIFIED") {
                    setUnverifiedEmail(email);
                } else {
                    setError("Invalid email or password");
                }
            } else {
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        try {
            setLoading(true);

            const response = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: unverifiedEmail }),
            });

            if (response.ok) {
                setError("");
                alert("Verification email sent. Please check your inbox.");
            } else {
                const data = await response.json();
                setError(data.error || "Failed to resend verification email");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
            console.error("Resend verification error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (unverifiedEmail) {
        return (
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                        <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Email Not Verified</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Your email <strong>{unverifiedEmail}</strong> has not been verified. Please check your inbox for the verification email.
                    </p>

                    <div className="mt-6 flex justify-center space-x-4">
                        <button
                            onClick={handleResendVerification}
                            disabled={loading}
                            className={`px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {loading ? "Sending..." : "Resend Verification Email"}
                        </button>
                        <button
                            onClick={() => setUnverifiedEmail("")}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                </label>
                <input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={loading}
                />
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={loading}
                />
                <div className="flex justify-end mt-1">
                    <Link href={`/auth/forgot-password`} className="text-sm text-blue-600 hover:text-blue-800">
                        Forgot password?
                    </Link>
                </div>
            </div>
            <button
                type="submit"
                className={`w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={loading}
            >
                {loading ? "Logging in..." : "Login"}
            </button>
            {error && <p className="p-3 bg-red-50 text-red-600 rounded-md">{error}</p>}
            <p className="text-sm text-center text-gray-600">
                Don&apos;t have an account?{" "}
                <Link href={`/auth/signup`} className="font-medium text-blue-600 hover:text-blue-500">
                    Sign up here
                </Link>
            </p>
        </form>
    );
}