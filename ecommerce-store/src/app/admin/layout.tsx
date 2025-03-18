// app/admin/layout.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import AdminSessionProvider from "@/components/admin/AdminSessionProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminSessionProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </AdminSessionProvider>
    );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            // Instead of redirecting to standard login, this should go to a 404
            router.push("/404");
            return;
        }

        // Check if user is an admin
        if (session?.user && !session.user.isAdmin) {
            // User is logged in but not an admin
            router.push("/404");
            return;
        }

        setLoading(false);
    }, [status, session, router, pathname]);

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/" });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 text-white">
                <div className="p-6">
                    <h1 className="text-2xl font-bold">Admin Panel</h1>
                </div>
                <nav className="mt-6">
                    <NavLink href="/admin" exact pathname={pathname}>
                        Dashboard
                    </NavLink>
                    <NavLink href="/admin/products" pathname={pathname}>
                        Products
                    </NavLink>
                    <NavLink href="/admin/orders" pathname={pathname}>
                        Orders
                    </NavLink>
                    <NavLink href="/admin/users" pathname={pathname}>
                        Users
                    </NavLink>
                    <NavLink href="/admin/settings" pathname={pathname}>
                        Settings
                    </NavLink>
                    <div className="border-t border-gray-700 my-4"></div>
                    <Link
                        href="/"
                        className="flex items-center px-6 py-3 text-gray-400 hover:text-white"
                        target="_blank"
                    >
                        View Store
                        <svg
                            className="ml-1 w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2h-4M14 4h6m0 0v6m0-6L10 14"
                            ></path>
                        </svg>
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="w-full text-left px-6 py-3 text-red-400 hover:text-red-300 mt-4"
                    >
                        Sign Out
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navigation */}
                <header className="bg-gray-800 shadow-md">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-4">
                            <span className="text-white">{pathname.split("/").pop()?.replace("-", " ") || "Dashboard"}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-white">{session?.user?.name || "Admin"}</span>
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                {session?.user?.name?.charAt(0) || "A"}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto bg-gray-900 p-6">
                    <div className="container mx-auto">{children}</div>
                </main>
            </div>
        </div>
    );
}

interface NavLinkProps {
    href: string;
    pathname: string;
    exact?: boolean;
    children: React.ReactNode;
}

function NavLink({ href, pathname, exact = false, children }: NavLinkProps) {
    const isActive = exact ? pathname === href : pathname.startsWith(href);

    return (
        <Link
            href={href}
            className={`flex items-center px-6 py-3 ${
                isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
        >
            {children}
        </Link>
    );
}