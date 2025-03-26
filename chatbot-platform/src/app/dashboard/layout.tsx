// src/app/dashboard/layout.tsx
"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileNav, useMobileNav } from "@/components/dashboard/MobileNav";

export default function DashboardLayoutContent({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const { isOpen, isMobile, toggle } = useMobileNav();

    return (
        <div className="flex h-screen overflow-hidden bg-[#0f1729]">
            {/* Mobile Nav Toggle */}
            {isMobile && <MobileNav isOpen={isOpen} toggle={toggle} />}

            {/* Mobile Sidebar Overlay */}
            {isOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={toggle}
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
                <Sidebar onClose={toggle} />
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