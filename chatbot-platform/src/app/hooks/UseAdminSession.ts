// hooks/useAdminSession.ts
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAdminSession(session: any, status: string) {
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;

        // If not authenticated, redirect to admin sign-in
        if (status === "unauthenticated") {
            router.push("/auth/signin");
            return;
        }

        // If not an admin, redirect to user dashboard
        if (session?.user?.role !== "admin") {
            router.push("/");
        }
    }, [session, status, router]);

    return { session, status };
}