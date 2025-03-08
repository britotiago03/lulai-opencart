"use client";

import { SessionProvider } from "next-auth/react";
import CheckoutComponent from "@/components/CheckoutComponent";

export default function CheckoutPage() {
    return (
        <SessionProvider>
            <CheckoutComponent/>
        </SessionProvider>
    );
}