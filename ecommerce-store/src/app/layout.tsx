import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PathnameProvider } from "@/components/layout/PathnameProvider";
import ClientLayout from "@/components/layout/ClientLayout"; // ✅ Import the new client layout
import "./globals.css";
import { initializeAdminSystem } from "@/lib/admin-init"; // ✅ Import admin system initializer

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
    description: "A fully functional Next.js authentication system",
};

// ✅ Ensure the admin system initializes only once
let initialized = false;
if (typeof window === "undefined" && !initialized) {
    initializeAdminSystem();
    initialized = true;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PathnameProvider>
            <ClientLayout>{children}</ClientLayout> {/* ✅ Now inside a client component */}
        </PathnameProvider>
        </body>
        </html>
    );
}
