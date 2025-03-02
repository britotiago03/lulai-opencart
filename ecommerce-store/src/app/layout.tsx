import React from "react";
import type { Metadata } from "next";
import "./globals.css";

// ✅ Keep static part of Navbar on the server (SSG)
import ServerNavbar from "@/components/ServerNavbar";
import ProvidersWrapper from "@/components/ProvidersWrapper"; // ✅ New Wrapper

export const metadata: Metadata = {
    title: "My Next.js App",
    description: "A fully functional Next.js authentication system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className="antialiased">
        <ProvidersWrapper> {/* ✅ Now this runs only on the client */}
            <ServerNavbar /> {/* ✅ Pre-rendered at build time */}
            {children}
        </ProvidersWrapper>
        </body>
        </html>
    );
}
