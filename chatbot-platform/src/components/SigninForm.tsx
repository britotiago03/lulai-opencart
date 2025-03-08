"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInForm() {
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
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setError("Invalid email or password");
            } else {
                router.push("/subscriptions");
                router.refresh();
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-gray-500 mb-2">Email address</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-transparent text-black h-12"
                    required
                    disabled={loading}
                />
            </div>
            <div>
                <label htmlFor="password" className="block text-gray-500 mb-2">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-transparent text-black h-12"
                    required
                    disabled={loading}
                />
            </div>
            <button
                type="submit"
                className={`w-full p-2 text-white bg-black rounded-lg h-12 hover:bg-gray-700 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={loading}
            >
                {loading ? "Logging in..." : "Sign In"}
            </button>
            {error && <p className="text-red-500">{error}</p>}
        </form>
    );
}