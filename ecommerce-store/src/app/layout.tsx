import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/layout/Providers";
import Navbar from "@/components/layout/Navbar";
import AIShoppingAssistant from "@/components/assistant/AIShoppingAssistant";
import "./globals.css";
import ChatWidget from "@/components/widget"; // Import the ChatWidget component

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "My Next.js App",
    description: "A fully functional Next.js e-commerce site with AI assistant",
};

// Enable static generation of the layout shell
export const dynamic = 'force-static';

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
            <Navbar />
            <ChatWidget/>
            <main>
                {children}
            </main>
            <AIShoppingAssistant />
        </Providers>
        </body>
        </html>
    );
}