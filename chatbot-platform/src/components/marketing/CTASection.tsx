import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
    return (
        <section className="bg-primary text-primary-foreground py-16">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-6">Get Early Access To our Beta Model</h2>
                <p className="max-w-2xl mx-auto mb-8">
                    Be among the first to experience the future of retail AI and transform your business.
                </p>
                <Link
                    href="/auth/signup"
                    className="inline-flex items-center bg-background text-foreground px-6 py-3 rounded-md hover:bg-muted transition-colors"
                >
                    Sign Up for the Beta
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </div>
        </section>
    );
}

export function NewsletterSection() {
    return (
        <section className="py-16 bg-muted">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-6">SIGN UP CONNECT WITH OUR UPDATES</h2>
                <p className="max-w-2xl mx-auto mb-8 text-muted-foreground">
                    We respect your privacy, so we never share your info.
                </p>
                <div className="max-w-xl mx-auto">
                    <form className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-grow px-4 py-3 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                            type="submit"
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                        >
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(true);
    const [showButton, setShowButton] = useState(false);

    // Show chat widget button after it's been closed
    useEffect(() => {
        if (!isOpen) {
            setShowButton(true);
        }
    }, [isOpen]);

    // Close the chat widget
    const handleClose = () => {
        setIsOpen(false);
    };

    // Open the chat widget
    const handleOpen = () => {
        setIsOpen(true);
        setShowButton(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-20">
            {isOpen ? (
                <div className="bg-card rounded-lg shadow-xl overflow-hidden w-64 border border-border animate-fade-in">
                    <div className="bg-primary text-primary-foreground p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6">
                                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="dark:invert">
                                    <rect width="32" height="32" rx="4" fill="currentColor"/>
                                    <path d="M8 8H12V12H8V8ZM14 8H18V12H14V8ZM20 8H24V12H20V8ZM8 14H12V18H8V14ZM14 14H18V18H14V14ZM20 14H24V18H20V14ZM8 20H12V24H8V20ZM14 20H18V24H14V20ZM20 20H24V24H20V20Z" fill="white"/>
                                </svg>
                            </div>
                            <span className="font-medium">Hey, Oliver</span>
                        </div>
                        <button
                            className="text-primary-foreground hover:text-white/80 transition-colors"
                            onClick={handleClose}
                            aria-label="Close chat"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="p-3 bg-muted">
                        <div className="flex mb-2">
                            <div className="mr-2">
                                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                                    AI
                                </div>
                            </div>
                            <div className="bg-card p-2 rounded-lg text-sm max-w-[80%]">
                                <p>Hello! How may I assist you today?</p>
                            </div>
                        </div>
                        <div className="flex justify-end mb-2">
                            <div className="bg-primary text-primary-foreground p-2 rounded-lg text-sm max-w-[80%]">
                                <p>Show me what can you do?</p>
                            </div>
                        </div>
                        <div className="flex mb-2">
                            <div className="mr-2">
                                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                                    AI
                                </div>
                            </div>
                            <div className="bg-card p-2 rounded-lg text-sm max-w-[80%]">
                                <p>As an AI assistant, I can help with:</p>
                                <ul className="list-disc pl-5 mt-1">
                                    <li>Product recommendations</li>
                                    <li>Answering questions about products</li>
                                    <li>Processing returns and orders</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            ) : showButton && (
                <button
                    onClick={handleOpen}
                    className="bg-primary text-primary-foreground p-3 rounded-full shadow-xl hover:bg-primary/90 transition-colors animate-fade-in"
                    aria-label="Open chat"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                    </svg>
                </button>
            )}
        </div>
    );
}