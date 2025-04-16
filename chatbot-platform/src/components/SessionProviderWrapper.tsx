// src/components/SessionProviderWrapper.tsx
'use client'

import React from "react";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

export default function SessionProviderWrapper({
    children,
    session,
}: {
    children: React.ReactNode;
    session: Session | null;
}) {
    return <SessionProvider>{children}</SessionProvider>
}