import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-muted py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-6 md:mb-0">
                        <div className="flex items-center">
                            {/* Logo */}
                            <div className="mr-2">
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="dark:invert">
                                    <rect width="32" height="32" rx="4" fill="currentColor"/>
                                    <path d="M8 8H12V12H8V8ZM14 8H18V12H14V8ZM20 8H24V12H20V8ZM8 14H12V18H8V14ZM14 14H18V18H14V14ZM20 14H24V18H20V14ZM8 20H12V24H8V20ZM14 20H18V24H14V20ZM20 20H24V24H20V20Z" fill="white"/>
                                </svg>
                            </div>
                            <span className="font-bold text-xl">LuIAI</span>
                        </div>
                        <p className="text-muted-foreground mt-2">© Copyright 2024 | LuIAI . All rights reserved.</p>
                    </div>

                    <div className="flex space-x-8">
                        <Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link>
                        <Link href="/process" className="text-muted-foreground hover:text-foreground">Process</Link>
                        <Link href="/features" className="text-muted-foreground hover:text-foreground">Features</Link>
                        <a href="mailto:Admin@lulai.ca" className="text-muted-foreground hover:text-foreground">Contact</a>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center mt-10 pt-8 border-t border-border">
                    <div className="mb-4 md:mb-0">
                        <button className="flex items-center text-muted-foreground hover:text-foreground">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>Chatbot</span>
                        </button>
                    </div>

                    <div className="flex space-x-6">
                        <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground">Terms & Conditions</Link>
                        <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}