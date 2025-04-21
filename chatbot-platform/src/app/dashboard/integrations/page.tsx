// src/app/dashboard/integrations/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import PageHeader from "@/components/dashboard/integrations/PageHeader";
import IntegrationForm from "@/components/dashboard/integrations/IntegrationForm";

export default function IntegrationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(status === "unauthenticated") {
            router.push("/auth/signin");
            return;
        } else {
            setLoading(false);
        }
    },[session, router, status]);

    // Loading state
    if (loading) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <PageHeader />
            <IntegrationForm />
        </div>
    );
}