"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function SignupForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccessMessage("Thanks for signing up! Please check your email to verify your account.");
                // Clear form
                setName("");
                setEmail("");
                setPassword("");
            } else {
                setError(data.error || "Signup failed");
            }
        } catch (error) {
            setError("An unexpected error occurred. Please try again.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (successMessage) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Check your email!</h3>
                    <p className="mt-1 text-sm text-gray-500">{successMessage}</p>

                    <div className="mt-6">
                        <p className="text-sm text-gray-500">
                            Already verified? <Link href={`/auth/login`} className="font-medium text-blue-600 hover:text-blue-500">
                            Log in here
                        </Link>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                </label>
                <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    required
                />
            </div>
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
                    minLength={8}
                />
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className={`w-full p-2 text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating account...
                    </span>
                ) : (
                    "Sign Up"
                )}
            </button>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-md">
                    {error}
                </div>
            )}

            <p className="text-sm text-center text-gray-600">
                Already have an account?{" "}
                <Link href={`/auth/login`} className="font-medium text-blue-600 hover:text-blue-500">
                    Log in here
                </Link>
            </p>
        </form>
    );
}