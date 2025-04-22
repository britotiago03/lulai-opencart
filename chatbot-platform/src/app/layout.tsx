// src/app/layout.tsx
import "./global.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { seedAdminIfNeeded } from "@/lib/seedAdmin";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "LulAI Chatbot Platform",
    description: "Create, integrate, and manage AI chatbots for your business",
};

export default async function RootLayout({
                                             children,
                                         }: {
    children: React.ReactNode;
}) {
    // ✅ Run server-side once at app startup
    await seedAdminIfNeeded();

    return (
        <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <AuthProvider>
                {children}
            </AuthProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
