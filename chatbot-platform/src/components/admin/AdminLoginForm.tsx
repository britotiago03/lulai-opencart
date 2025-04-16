"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminSessionProvider from "./AdminSessionProvider1";

interface AdminLoginPageProps {
    securePath: string;
}

function AdminLoginFormContent({ securePath }: AdminLoginPageProps) {
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
                setError(result.error);
                return;
            }
    
             // Set the admin-auth cookie with proper attributes
             document.cookie = `admin-auth=true; Path=/admin; Max-Age=${8*60*60}; SameSite=Strict; Secure${process.env.NODE_ENV === 'production' ? '; HttpOnly' : ''}`;
            
             // Force session update and redirect
             window.location.href = "/admin"; // Full page reload ensures cookie is set
            
    
        } catch (err) {
            console.error("Login error:", err);
            setError("Authentication failed");
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

export default function AdminLoginForm({ securePath }: AdminLoginPageProps) {
    return (
        <AdminSessionProvider>
            <AdminLoginFormContent securePath={securePath} />
        </AdminSessionProvider>
    );
}