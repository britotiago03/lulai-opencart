// src/app/layout.tsx
import "./global.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "LulAI Chatbot Platform",
    description: "Create, integrate, and manage AI chatbots for your business",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
        <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                {children}
            </ThemeProvider>
        </AuthProvider>
        </body>
        </html>
    );
}