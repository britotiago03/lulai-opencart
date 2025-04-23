"use client";

import Link from "next/link";
import { Layout } from "@/components/home/Layout";
import { useTheme } from "@/components/ThemeProvider";

export default function NotFound() {
    const { theme } = useTheme();

    return (
        <Layout>
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <h1 className="text-6xl font-bold mb-4">404</h1>
                <h2 className="text-3xl font-semibold mb-6">Page Not Found</h2>
                <p className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} max-w-lg mb-8`}>
                    Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                    <Link
                        href="/"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium transition-colors"
                    >
                        Return Home
                    </Link>
                    <Link
                        href={`/dashboard`}
                        className={`${
                            theme === 'dark'
                                ? 'border-gray-600 hover:border-gray-400'
                                : 'border-gray-300 hover:border-gray-500'
                        } border px-6 py-3 rounded-md text-lg font-medium transition-colors`}
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </Layout>
    );
}