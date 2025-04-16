"use client";

import { SessionProvider } from "next-auth/react";
import SubscriptionsComponent from "@/components/subscription/SubscriptionsComponent";

export default function SubscriptionsPage() {
    return (
        <SessionProvider>
            <SubscriptionsComponent/>
        </SessionProvider>
    );
}