// components/admin/AdminSessionProvider.tsx
"use client";

import { SessionProvider } from "next-auth/react";

export default function AdminSessionProvider({ 
    children,
    session
}: { 
    children: React.ReactNode,
    session: any // Session type from next-auth
}) {
    return (
        <SessionProvider
            session={session}
            basePath="/api/admin-auth" // Changed to match standard NextAuth convention
            refetchInterval={5 * 60} // Refresh session every 5 minutes
            refetchOnWindowFocus={true}
        >
            {children}
        </SessionProvider>
    );
}