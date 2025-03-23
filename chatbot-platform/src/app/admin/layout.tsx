// src/app/admin/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { usePathname, useRouter } from "next/navigation";

// This would eventually use your auth system
const useCheckAdminRole = () => {
    const [isAdmin, setIsAdmin] = useState(true); // Default to true for now
    const router = useRouter();

    useEffect(() => {
        // This would be replaced with real auth check from your auth context
        // For now, we'll just simulate being an admin
        const checkIfAdmin = async () => {
            try {
                // Replace with actual admin check
                // const { isAdmin } = await checkUserRole();
                const isAdmin = true; // Simulated for now

                if (!isAdmin) {
                    router.push('/dashboard'); // Redirect to client dashboard if not admin
                }

                setIsAdmin(isAdmin);
            } catch (error) {
                console.error("Error checking admin status:", error);
                router.push('/auth/login');
            }
        };

        checkIfAdmin();
    }, [router]);

    return isAdmin;
};

export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    const isAdmin = useCheckAdminRole();
    const [isMobile, setIsMobile] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        // Initial check
        checkIfMobile();

        // Add event listener for window resize
        window.addEventListener('resize', checkIfMobile);

        // Cleanup
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    if (!isAdmin) {
        return <div className="flex items-center justify-center h-screen bg-[#0f1729] text-white">Checking permissions...</div>;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#0f1729]">
            {/* Mobile Nav Toggle */}
            {isMobile && <MobileNav isOpen={isOpen} toggle={toggleSidebar} />}

            {/* Mobile Sidebar Overlay */}
            {isOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={toggleSidebar}
                    aria-hidden="true"
                />
            )}

            {/* Admin Sidebar - either fixed or hidden on mobile */}
            <div
                className={`${
                    isMobile
                        ? `fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out ${
                            isOpen ? "translate-x-0" : "-translate-x-full"
                        }`
                        : "sticky top-0 h-screen w-64 flex-shrink-0"
                }`}
            >
                <AdminSidebar onClose={toggleSidebar} />
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