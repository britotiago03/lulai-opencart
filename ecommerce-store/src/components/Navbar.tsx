"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="flex justify-between p-4 bg-gray-800 text-white">
            <Link href="/" className="text-lg font-bold">My App</Link>

            <div>
                {session ? (
                    <div className="flex items-center gap-4">
                        <p>Welcome, {session.user?.name}</p>
                        <button
                            onClick={() => signOut({ callbackUrl: "/auth/login" })}
                            className="bg-red-500 px-4 py-2 rounded"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-4">
                        <Link href="/auth/login" className="px-4 py-2 bg-blue-500 rounded">Login</Link>
                        <Link href="/auth/signup" className="px-4 py-2 bg-green-500 rounded">Sign Up</Link>
                    </div>
                )}
            </div>
        </nav>
    );
}