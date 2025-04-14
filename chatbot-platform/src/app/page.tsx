// src/app/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HomePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (status === "authenticated") {
            if (session?.user?.role === "admin") {
                router.push("/admin");
            } else {
                router.push("/dashboard");
            }
        }
    }, [session, status, router]);

    // Prevent hydration mismatch
    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#0f1729] text-white">
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
                    <ThemeToggle />

                    {status === "authenticated" ? (
                        <Link
                            href="/dashboard"
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/auth/signin"
                                className="text-gray-300 hover:text-white px-4 py-2 transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/auth/signup"
                                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        AI Chatbots for <span className="text-blue-500">Modern E-commerce</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
                        Engage customers, boost sales, and provide 24/7 support with our intelligent chatbot platform
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Link
                            href="/auth/signup"
                            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md text-lg font-medium transition-colors"
                        >
                            Get Started
                        </Link>
                        <Link
                            href="#features"
                            className="border border-gray-600 hover:border-gray-400 px-6 py-3 rounded-md text-lg font-medium transition-colors"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>

                {/* Features Section */}
                <section id="features" className="py-16">
                    <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-[#1b2539] p-6 rounded-lg">
                            <div className="bg-blue-600/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Smart Conversations</h3>
                            <p className="text-gray-400">Our AI understands natural language and provides context-aware responses to customer queries.</p>
                        </div>

                        <div className="bg-[#1b2539] p-6 rounded-lg">
                            <div className="bg-purple-600/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Product Catalog Integration</h3>
                            <p className="text-gray-400">Seamlessly connect your product catalog to allow chatbot to recommend products and answer questions.</p>
                        </div>

                        <div className="bg-[#1b2539] p-6 rounded-lg">
                            <div className="bg-green-600/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Detailed Analytics</h3>
                            <p className="text-gray-400">Track performance, monitor customer satisfaction, and gain insights from conversation analytics.</p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 text-center">
                    <div className="bg-[#1b2539] p-10 rounded-xl">
                        <h2 className="text-3xl font-bold mb-4">Ready to transform your customer support?</h2>
                        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                            Join thousands of businesses using LulAI to improve customer engagement and boost sales
                        </p>
                        <Link
                            href="/auth/signup"
                            className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-md text-lg font-medium transition-colors"
                        >
                            Start Free Trial
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="border-t border-gray-800 mt-12 py-8">
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
                        <Link href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</Link>
                        <Link href="#" className="text-gray-400 hover:text-white transition-colors">Terms</Link>
                        <Link href="#" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}