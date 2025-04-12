// components/admin/AdminSessionProvider.tsx
"use client";

import { SessionProvider } from "next-auth/react";

export default function AdminSessionProvider({ 
    children 
}: { 
    children: React.ReactNode 
}) {
    return (
        <SessionProvider
            basePath="/api/admin-auth"
            refetchOnWindowFocus={true}
        >
            {children}
        </SessionProvider>
    );
}