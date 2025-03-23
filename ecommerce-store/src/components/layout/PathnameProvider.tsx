"use client";

import React, { createContext, useContext } from "react";
import { usePathname } from "next/navigation";

// ✅ Create a React Context to store the pathname
const PathnameContext = createContext<string | null>(null);

/**
 * Provides the current pathname using Next.js `usePathname()`.
 * This ensures `usePathname()` is used only inside a client component.
 */
export function PathnameProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    return <PathnameContext.Provider value={pathname}>{children}</PathnameContext.Provider>;
}

/**
 * Hook to access the current pathname.
 * Must be used inside a component wrapped by `PathnameProvider`.
 */
export function usePathnameContext() {
    const context = useContext(PathnameContext);
    if (context === null) {
        throw new Error("usePathnameContext must be used within a PathnameProvider");
    }
    return context;
}
