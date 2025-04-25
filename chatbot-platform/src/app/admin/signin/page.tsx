// admin/signin/page.tsx
"use client";

import React from "react";
import AdminSessionProvider from "@/components/admin/AdminSessionProvider";
import AdminSignInContent from "@/components/admin/signin/AdminSignInContent";

export default function AdminSignInPage() {
    return (
        <AdminSessionProvider>
            <AdminSignInContent />
        </AdminSessionProvider>
    );
}