import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/Providers"; // ✅ Import Providers
import Navbar from "@/components/Navbar"; // ✅ Import Navbar
import "./globals.css";

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

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>  {/* ✅ Wrap everything in Providers */}
            <Navbar />
            {children}
        </Providers>
        </body>
        </html>
    );
}
