"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <header className="bg-background border-b border-border sticky top-0 z-30">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <div className="flex items-center">
                            <div className="mr-2 flex flex-shrink-0">
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="dark:invert">
                                    <rect width="32" height="32" rx="4" fill="currentColor"/>
                                    <path d="M8 8H12V12H8V8ZM14 8H18V12H14V8ZM20 8H24V12H20V8ZM8 14H12V18H8V14ZM14 14H18V18H14V14ZM20 14H24V18H20V14ZM8 20H12V24H8V20ZM14 20H18V24H14V20ZM20 20H24V24H20V20Z" fill="white"/>
                                </svg>
                            </div>
                            <span className="font-bold text-2xl">lulAI</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-10">
                        <Link
                            href="/"
                            className={`transition-colors ${
                                isActive('/') ? 'font-medium' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Home
                        </Link>
                        <Link
                            href="/process"
                            className={`transition-colors ${
                                isActive('/process') ? 'font-medium' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Process
                        </Link>
                        <Link
                            href="/features"
                            className={`transition-colors ${
                                isActive('/features') ? 'font-medium' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Features
                        </Link>
                    </nav>

                    <div className="flex items-center space-x-4">
                        <ThemeToggle />

                        {/* CTA Button */}
                        <div className="hidden md:block">
                            <Link
                                href="/auth/signup"
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                            >
                                Sign Up for the Beta
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            type="button"
                            className="md:hidden rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border">
                        <Link
                            href="/"
                            className={`block px-3 py-2 rounded-md text-base font-medium ${
                                isActive('/') ? 'bg-gray-100 dark:bg-gray-800' : 'text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-foreground'
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            href="/process"
                            className={`block px-3 py-2 rounded-md text-base font-medium ${
                                isActive('/process') ? 'bg-gray-100 dark:bg-gray-800' : 'text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-foreground'
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Process
                        </Link>
                        <Link
                            href="/features"
                            className={`block px-3 py-2 rounded-md text-base font-medium ${
                                isActive('/features') ? 'bg-gray-100 dark:bg-gray-800' : 'text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-foreground'
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Features
                        </Link>
                        <Link
                            href="/auth/signup"
                            className="block w-full px-3 py-2 rounded-md text-base font-medium text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 text-center"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Sign Up for the Beta
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}