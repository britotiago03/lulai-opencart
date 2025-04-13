// src/components/dashboard/MobileNav.tsx
"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";

export function useMobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Initial check
        checkScreenSize();

        // Attach event listener for window resize
        window.addEventListener("resize", checkScreenSize);

        // Clean up event listener on unmount
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    return { isOpen, isMobile, toggle };
}

export function MobileNav({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) {
    return (
        <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-gray-800 bg-[#0f1729] px-4 sm:static md:hidden">
            <button
                className="inline-flex h-10 w-10 items-center justify-center text-gray-400"
                onClick={toggle}
            >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="flex items-center gap-2">
                <Image src="/images/logo.png" alt="LulAI Logo" width={30} height={30} />
                <span className="font-bold text-white">LulAI</span>
            </div>
        </div>
    );
}