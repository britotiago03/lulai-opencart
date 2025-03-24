"use client";

import React from "react";
import { usePathnameContext } from "@/components/layout/PathnameProvider";
import Providers from "@/components/layout/Providers";
import Navbar from "@/components/layout/Navbar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathnameContext();

    // ✅ Check if the current route is part of the admin system
    const isAdminSetup = pathname.startsWith("/admin-setup");
    const isAdmin = pathname.startsWith("/admin");
    const isSecureAdmin = /^\/secure-admin-\d{4}$/.test(pathname); // ✅ Match secure admin login

    return isAdminSetup || isAdmin || isSecureAdmin ? (
        <main>{children}</main> // ✅ No Navbar or Providers
    ) : (
        <Providers>
            <Navbar />
            <main>{children}</main>
        </Providers>
    );
}