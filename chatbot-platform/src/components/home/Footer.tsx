// src/components/home/Footer.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/components/ThemeProvider";

export const Footer = () => {
    const { theme } = useTheme();

    return (
        <footer className={`${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} border-t mt-12 py-8`}>
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center mb-4 md:mb-0">
                    <Image
                        src="/images/logo.png"
                        alt="LulAI Logo"
                        width={30}
                        height={30}
                        className="mr-2"
                    />
                    <span>© 2025 LulAI. All rights reserved.</span>
                </div>
                <div className="flex space-x-6">
                    <Link
                        href="#"
                        className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}
                    >
                        Privacy
                    </Link>
                    <Link
                        href="#"
                        className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}
                    >
                        Terms
                    </Link>
                    <Link
                        href="#"
                        className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}
                    >
                        Contact
                    </Link>
                </div>
            </div>
        </footer>
    );
};