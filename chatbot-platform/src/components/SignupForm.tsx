"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupForm() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const endpoint = "/api/auth/signup";

        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        if (res.ok) {
            router.push("/auth/login");
        } else {
            const data = await res.json();
            setError(data.error || "Signup failed");
        }
    };

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