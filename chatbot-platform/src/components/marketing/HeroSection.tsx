// src/components/marketing/HeroSection.tsx
import Link from 'next/link';
import Image from 'next/image';

export function HeroSection() {
    return (
        <section className="py-20 bg-gradient-to-b from-background to-muted">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
                            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">We Put AI in Retail</h1>
                            <h2 className="text-xl sm:text-2xl font-semibold mb-6">Create, Train and Deploy Your Bespoke AI Store Agent.</h2>
                            <p className="text-muted-foreground mb-8">
                                Empower your online or physical store with an active operational AI agent that delivers personalized experiences,
                                offers 24/7 intelligent customer service, automates routine tasks, and provides actionable insights to elevate
                                satisfaction and drive sustained sales growth.
                            </p>
                            <Link
                                href="/auth/signup"
                                className="inline-flex items-center bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
                            >
                                Try Our AI Store Agent in Beta
                                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>
                        </div>
                        <div className="md:w-1/2">
                            <div className="relative">
                                {/* Main illustration */}
                                <div className="bg-gradient-to-tr from-secondary to-background p-8 rounded-lg shadow-xl">
                                    <div className="relative w-full aspect-[4/3] bg-gray-200 dark:bg-gray-800 rounded-lg">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <p className="text-muted-foreground text-sm">Retail AI Illustration</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Chat example */}
                                <div className="absolute top-10 right-0 transform translate-x-1/4 bg-card dark:bg-card border border-border p-4 rounded-lg shadow-lg w-64">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs text-white font-medium">AI</div>
                                        <div className="text-sm font-medium">Inbox: Example Essentials</div>
                                    </div>
                                    <div className="bg-muted rounded p-2 mb-2">
                                        <p className="text-sm">Looking for the perfect dining set for your home?</p>
                                    </div>
                                    <button className="w-full bg-black text-white dark:bg-white dark:text-black rounded-md py-2 text-sm font-medium">
                                        Shop Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}