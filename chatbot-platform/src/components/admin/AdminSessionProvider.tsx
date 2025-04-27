"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";

export default function AdminSessionProvider({
                                                 children,
                                             }: {
    children: React.ReactNode;
}) {
    return (
        <SessionProvider
            basePath="/api/admin-auth"
            refetchInterval={5 * 60}
            refetchOnWindowFocus={true}
        >
            {children}
        </SessionProvider>
    );
}