"use client";

import { SessionProvider } from "next-auth/react";
import SubscriptionsComponent from "@/components/SubscriptionsComponent";

export default function SubscriptionsPage() {
    return (
        <SessionProvider>
            <SubscriptionsComponent/>
        </SessionProvider>
    );
}