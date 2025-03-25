"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import AdminSessionProvider from "./AdminSessionProvider";
import Image from "next/image";
import AdminLoginForm from "./AdminLoginForm";

interface AdminLoginPageProps {
    securePath: string;
}

// Using destructuring without assignment to ignore the parameter completely
// SUBJECT FOR DELETION AFTER TESTING
function AdminLoginContent({}: AdminLoginPageProps) {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("admin-credentials", {
                redirect: false,
                email,
                password,
                callbackUrl: "/admin"
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

function AdminLoginContent2({securePath}: AdminLoginPageProps) {
    const router = useRouter();
    
        
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row w-full max-w-4xl">
                    {/* Basic page information */}
                    <div className="flex flex-col items-center justify-center w-full md:w-1/2 p-4 md:mr-32">
                        <Image
                            src="/lulAI_logo.png"
                            alt="Next.js logo"
                            width={180 * 2}
                            height={38 * 2}
                            priority
                        />
                        <p className="font-[family-name:var(--font-dm-sans)] text-center text-gray-500 max-w-4xl mt-4">
                            Our AI-powered chatbot is designed to revolutionize your in-store shopping experience. With a wide range of capabilities, it serves
                            as your virtual in-store expert, providing valuable assistance
                            to both retailers and customers. Here's what our
                            chatbot can do.
                        </p>
                    </div>
    
                    {/* Admin Login Form */}
                    <div className="relative flex flex-col items-center justify-center w-full md:w-1/2 p-4 md:ml-32 mt-4 md:mt-0">
                        <div className="w-full max-w-md">
                            <div className="flex justify-center mb-4">
                                <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">Admin login page</h1>
                            </div>
                            <div className="relative w-full">
                                <AdminLoginForm securePath={securePath} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
}

// Wrap the login page with our custom Admin Session Provider
export default function AdminLoginPage({ securePath }: AdminLoginPageProps) {
    return (
        <AdminSessionProvider>
            <AdminLoginContent2 securePath={securePath} />
        </AdminSessionProvider>
    );
}