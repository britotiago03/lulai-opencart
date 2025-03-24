"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupForm() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const endpoint = "/api/auth/signup";

        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        if (res.ok) {
            setSuccessMessage("Thanks for signing up! Please check your email to verify your account.");
            router.push("/auth/signin");
        } else {
            const data = await res.json();
            setError(data.error || "Signup failed");
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
                            Already verified? <Link href={`/auth/signin`} className="font-medium text-blue-600 hover:text-blue-500">
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
                <label htmlFor="password" className="block text-gray-500 mb-2">Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 h-12 border border-gray-300 rounded-lg bg-transparent text-black"
                    required
                />
            </div>
            <div>
                <label htmlFor="email" className="block text-gray-500 mb-2">Email address</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 h-12 border border-gray-300 rounded-lg bg-transparent text-black"
                    required
                />
            </div>
            <div>
                <label htmlFor="password" className="block text-gray-500 mb-2">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 h-12 border border-gray-300 rounded-lg bg-transparent text-black"
                    required
                />
            </div>
            <button
                type="submit"
                className="w-full p-2 h-12 text-white bg-black rounded-lg hover:bg-gray-700"
            >
                Sign Up
            </button>
            {error && <p className="text-red-500">{error}</p>}
        </form>
    );
}