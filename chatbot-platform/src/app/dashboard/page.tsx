"use client";

import GuestDashboard from "@/components/GuestDashboard";
import { SessionProvider } from "next-auth/react";

export default function HomePage() {
    return (
        <SessionProvider>
            <GuestDashboard/>
        </SessionProvider>        
      );
}