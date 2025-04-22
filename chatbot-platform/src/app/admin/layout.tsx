// src/app/admin/layout.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin-dashboard/AdminSidebar";
import { MobileNav, useMobileNav } from "@/components/dashboard/MobileNav";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import AdminSessionProvider from "@/components/admin/AdminSessionProvider";

// Content component that uses session
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const { isOpen, isMobile, toggleAction } = useMobileNav();

    // Define pages that don't require authentication
    const publicAdminPages = ['/admin/setup', '/admin/signin'];

    const isPublicPage = publicAdminPages.some(page =>
        pathname === page || pathname.startsWith(`${page}?`));

    useEffect(() => {
        console.log("Admin layout - Auth check - Path:", pathname);
        console.log("Admin layout - Auth check - Status:", status);
        console.log("Admin layout - Auth check - Is public:", isPublicPage);
        console.log("Admin layout - Auth check - User:", session?.user);

        // If this is a public admin page, don't check authentication
        if (isPublicPage) {
            console.log("Admin layout - Public page, skipping auth check");
            setLoading(false);
            return;
        }

        // For protected admin pages, check authentication
        if (status === "unauthenticated") {
            console.log("Admin layout - Unauthenticated, redirecting to admin signin");
            router.push("/admin/signin");
            return;
        }

        if (status === "authenticated") {
            // Check if the user is an admin
            if (!session?.user?.isAdmin) {
                console.log("Admin layout - Not admin, redirecting to user dashboard");
                router.push("/dashboard");
                return;
            }

            console.log("Admin layout - Admin authenticated, proceeding");
            setLoading(false);
        }
    }, [session, status, router, pathname, isPublicPage]);

    // For public pages like setup and signin, just render the children directly without admin UI
    if (isPublicPage) {
        return <>{children}</>;
    }

    // Show loading state while checking authentication
    if (status === "loading" || loading) {
        return <LoadingSkeleton />;
    }

    // Safety check - don't render admin UI for non-admins
    if (status === "authenticated" && !session?.user?.isAdmin) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#0f1729]">
            {/* Mobile Nav Toggle */}
            {isMobile && <MobileNav isOpen={isOpen} toggleAction={toggleAction} />}

            {/* Mobile Sidebar Overlay */}
            {isOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={toggleAction}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar - either fixed or hidden on mobile */}
            <div
                className={`${
                    isMobile
                        ? `fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out ${
                            isOpen ? "translate-x-0" : "-translate-x-full"
                        }`
                        : "sticky top-0 h-screen w-64 flex-shrink-0"
                }`}
            >
                <AdminSidebar onClose={toggleAction} />
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-[#0f1729] text-white">
                {/* This padding is only needed on mobile when the navbar toggle is shown */}
                {isMobile && <div className="h-14"></div>}
                {children}
            </main>
        </div>
    );
}

// Wrapper component with AdminSessionProvider
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminSessionProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </AdminSessionProvider>
    );
}