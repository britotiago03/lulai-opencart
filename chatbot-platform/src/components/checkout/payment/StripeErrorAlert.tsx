// src/components/checkout/payment/StripeErrorAlert.tsx
"use client";

import { AlertCircle } from "lucide-react";

interface StripeErrorAlertProps {
    message: string;
}

export function StripeErrorAlert({ message }: StripeErrorAlertProps) {
    return (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded mb-4 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{message}</span>
        </div>
    );
}
