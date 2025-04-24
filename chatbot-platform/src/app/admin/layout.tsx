// src/app/admin/layout.tsx
"use client";

import { usePathname } from "next/navigation";
import React from "react";
import { AdminSidebar } from "@/components/admin-dashboard/AdminSidebar";
import { MobileNav, useMobileNav } from "@/components/dashboard/MobileNav";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import AdminSessionProvider from "@/components/admin/AdminSessionProvider";
import { useAdminAuth } from "@/hooks/useAdminAuth";

// Content component that uses our custom auth hook
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isOpen, isMobile, toggleAction } = useMobileNav();

    // Define pages that don't require authentication
    const publicAdminPages = ['/admin/setup', '/admin/signin'];
    const isPublicPage = publicAdminPages.some(page =>
        pathname === page || pathname.startsWith(`${page}?`));

    // Only check admin auth for protected pages
    const { isLoading, isAdmin } = useAdminAuth({
        requiredAdmin: !isPublicPage,
        redirectTo: '/admin/signin'
    });

    // For public pages, render directly without admin shell
    if (isPublicPage) {
        return <>{children}</>;
    }

    // Show loading while checking auth
    if (isLoading) {
        return <LoadingSkeleton />;
    }

    // If required admin check failed, don't render anything (redirect will happen in hook)
    if (!isPublicPage && !isAdmin) {
        return null;
    }

    // Admin is authenticated, render admin UI
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

            {/* Sidebar */}
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
                {isMobile && <div className="h-14"></div>}
                {children}
            </main>
        </div>
    );
}

// Wrapper with provider
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminSessionProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </AdminSessionProvider>
    );
}