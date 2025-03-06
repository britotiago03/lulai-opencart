"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AccountLayout({
                                          children,
                                      }: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (status === "unauthenticated") {
            router.push(`/auth/login?callbackUrl=${pathname}`);
        }
    }, [status, router, pathname]);

    // Show loading state while checking session
    if (!isClient || status === "loading") {
        return (
            <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // If user is not logged in, don't show any content (will redirect)
    if (status === "unauthenticated") {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="md:w-1/4">
                    <div className="bg-white rounded-lg shadow-md p-4 sticky top-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold mb-2">My Account</h2>
                            <p className="text-gray-600">{session?.user?.name}</p>
                            <p className="text-gray-600 text-sm">{session?.user?.email}</p>
                        </div>

                        <nav className="space-y-1">
                            <NavLink href="/account" active={pathname === "/account"}>
                                Dashboard
                            </NavLink>
                            <NavLink
                                href="/account/orders"
                                active={pathname === "/account/orders" || pathname.startsWith("/account/orders/")}
                            >
                                Orders
                            </NavLink>
                            <NavLink href="/account/profile" active={pathname === "/account/profile"}>
                                Profile
                            </NavLink>
                            <NavLink href="/api/auth/signout" active={false} isLogout>
                                Sign Out
                            </NavLink>
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="md:w-3/4">
                    <div className="bg-white rounded-lg shadow-md p-6">{children}</div>
                </div>
            </div>
        </div>
    );
}

// Helper component for navigation links
function NavLink({
                     href,
                     active,
                     isLogout = false,
                     children
                 }: {
    href: string;
    active: boolean;
    isLogout?: boolean;
    children: React.ReactNode;
}) {
    const baseClasses = "block px-4 py-2 rounded transition";
    const activeClasses = "bg-blue-50 text-blue-700 font-medium";
    const inactiveClasses = "hover:bg-gray-100";
    const logoutClasses = "text-red-600 hover:bg-red-50 mt-4";

    const classes = `${baseClasses} ${active ? activeClasses : inactiveClasses} ${isLogout ? logoutClasses : ""}`;

    return (
        <Link href={href} className={classes}>
            {children}
        </Link>
    );
}