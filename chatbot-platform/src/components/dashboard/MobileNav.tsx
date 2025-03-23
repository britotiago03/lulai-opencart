// src/components/dashboard/MobileNav.tsx
"use client";

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface MobileNavProps {
    isOpen: boolean;
    toggle: () => void;
}

export function MobileNav({ isOpen, toggle }: MobileNavProps) {
    return (
        <button
            className="fixed z-50 top-4 left-4 p-2 rounded-md bg-[#1b2539] text-white shadow-md lg:hidden"
            onClick={toggle}
            aria-label={isOpen ? "Close menu" : "Open menu"}
        >
            {isOpen ? (
                <X className="h-6 w-6" />
            ) : (
                <Menu className="h-6 w-6" />
            )}
        </button>
    );
}

export function useMobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 1024);
            // Close sidebar if we're resizing from mobile to desktop
            if (window.innerWidth >= 1024) {
                setIsOpen(false);
            }
        };

        // Initial check
        checkIfMobile();

        // Add event listener for window resize
        window.addEventListener('resize', checkIfMobile);

        // Cleanup
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    const toggle = () => {
        setIsOpen(!isOpen);
        // Prevent body scroll when menu is open on mobile
        if (typeof document !== 'undefined') {
            document.body.style.overflow = !isOpen ? 'hidden' : '';
        }
    };

    return {
        isOpen,
        isMobile,
        toggle
    };
}