// src/components/home/Layout.tsx
"use client";
import { ReactNode } from "react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { useTheme } from "@/components/ThemeProvider";

type LayoutProps = {
    children: ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
    const { theme } = useTheme();

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0f1729] text-white' : 'bg-gray-50 text-gray-900'}`}>
            <Header />
            <main className="max-w-7xl mx-auto px-4 py-16">
                {children}
            </main>
            <Footer />
        </div>
    );
};