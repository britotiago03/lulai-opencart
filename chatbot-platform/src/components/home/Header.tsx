// src/components/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Header = () => {
    const isAuthenticated = false;

    return (
        <header className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
            <div className="flex items-center">
                <Image
                    src="/images/logo.png"
                    alt="LulAI Logo"
                    width={40}
                    height={40}
                    className="mr-3"
                />
                <span className="text-xl font-bold">LulAI</span>
            </div>

            <div className="flex items-center space-x-4">
                {/* Theme toggle button */}
                <ThemeToggle />

                {isAuthenticated ? (
                    <Link
                        href="/dashboard"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                        Dashboard
                    </Link>
                ) : (
                    <>
                        <Link
                            href="/auth/signin"
                            className="text-muted-foreground hover:text-foreground px-4 py-2 transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/auth/signup"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                        >
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
};