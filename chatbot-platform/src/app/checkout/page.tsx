"use client";

import { SessionProvider } from "next-auth/react";
import CheckoutPageComponent from "@/components/checkout/CheckoutPageComponent";

export default function CheckoutPage() {
    return (
        <SessionProvider>
            <CheckoutPageComponent/>
        </SessionProvider>
    );
}