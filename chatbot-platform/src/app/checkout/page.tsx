"use client";

import { SessionProvider } from "next-auth/react";
import CheckoutComponent from "@/components/checkout/CheckoutComponent";

export default function CheckoutPage() {
    return (
        <SessionProvider>
            <CheckoutComponent/>
        </SessionProvider>
    );
}