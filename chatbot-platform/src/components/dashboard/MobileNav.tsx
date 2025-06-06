// src/components/dashboard/MobileNav.tsx
"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export function useMobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const toggleAction = () => setIsOpen(!isOpen);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    return { isOpen, isMobile, toggleAction };
}

export function MobileNav({ isOpen, toggleAction }: { isOpen: boolean; toggleAction: () => void }) {
    return (
        <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-gray-800 bg-[#0f1729] px-4 sm:static md:hidden">
            <button
                className="inline-flex h-10 w-10 items-center justify-center text-gray-400"
                onClick={toggleAction}
                aria-label="Toggle Menu"
            >
                {isOpen ? (
                    <X className="h-6 w-6" data-testid="icon-x" />
                ) : (
                    <Menu className="h-6 w-6" data-testid="icon-menu" />
                )}
            </button>
            <div className="flex items-center">
                <span className="font-bold text-white text-lg">LulAI</span>
            </div>
        </div>
    );
}
