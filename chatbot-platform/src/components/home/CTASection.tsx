// src/components/home/CTASection.tsx
"use client";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";

export const CTASection = () => {
    const { theme } = useTheme();

    return (
        <section className="py-16 text-center">
            <div className={`${theme === 'dark' ? 'bg-[#1b2539]' : 'bg-white shadow-lg'} p-10 rounded-xl`}>
                <h2 className="text-3xl font-bold mb-4">Ready to transform your customer support?</h2>
                <p className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-8 max-w-2xl mx-auto`}>
                    Join thousands of businesses using LulAI to improve customer engagement and boost sales
                </p>
                <Link
                    href={`/auth/signup`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-md text-lg font-medium transition-colors"
                >
                    Start Free Trial
                </Link>
            </div>
        </section>
    );
};