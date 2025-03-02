"use client"; // ✅ Must be a client component

import React from "react";
import Providers from "@/components/Providers";

export default function ProvidersWrapper({ children }: { children: React.ReactNode }) {
    return <Providers>{children}</Providers>;
}
