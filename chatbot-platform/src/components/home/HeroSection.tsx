// src/components/home/HeroSection.tsx
"use client";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";

export const HeroSection = () => {
    const { theme } = useTheme();

    return (
        <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
                AI Chatbots for <span className="text-blue-500">Modern E-commerce</span>
            </h1>
            <p className={`text-xl md:text-2xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto`}>
                Engage customers, boost sales, and provide 24/7 support with our intelligent chatbot platform
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                    href={`/auth/signup`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium transition-colors"
                >
                    Get Started
                </Link>
                <Link
                    href={`#features`}
                    className={`${theme === 'dark' ? 'border-gray-600 hover:border-gray-400' : 'border-gray-300 hover:border-gray-500'} border px-6 py-3 rounded-md text-lg font-medium transition-colors`}
                >
                    Learn More
                </Link>
            </div>
        </div>
    );
};