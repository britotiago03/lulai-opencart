// src/app/layout.tsx
import "./global.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { initializeAdminSystem } from "@/lib/admin-init";
import { SessionProvider } from "next-auth/react";
import { getServerSession } from "next-auth";
import { userAuthOptions } from "@/lib/auth-config";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "LulAI Chatbot Platform",
    description: "Create, integrate, and manage AI chatbots for your business",
};

// Ensure the admin system initializes only once
let initialized = false;
if (typeof window === "undefined" && !initialized) {
    initializeAdminSystem();
    initialized = true;
}

export default async function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {

    const session = await getServerSession(userAuthOptions);
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <SessionProviderWrapper session={session}>
                    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                        {children}
                    </ThemeProvider>
                </SessionProviderWrapper>
            </body>
        </html>
    );
}