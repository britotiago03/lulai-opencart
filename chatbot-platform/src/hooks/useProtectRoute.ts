// src/hooks/useProtectRoute.ts
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function useProtectRoute(requiredRole: "admin" | "user" | "any" = "any") {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

    useEffect(() => {
        // Only run checks once auth is loaded
        if (!loading) {
            // Check if authenticated
            if (!user) {
                // Redirect to login page with return URL
                router.push(`/auth/login?returnUrl=${encodeURIComponent(pathname)}`);
                return;
            }

            // Check role if a specific role is required
            if (requiredRole !== "any" && user.role !== requiredRole) {
                // Redirect based on role
                if (user.role === "admin") {
                    // Admins go to admin dashboard
                    router.push("/admin");
                } else {
                    // Regular users go to client dashboard
                    router.push("/dashboard");
                }
                return;
            }

            // User is authenticated and has the required role
            setIsAuthorized(true);
        }
    }, [loading, user, router, pathname, requiredRole]);

    return { isAuthorized, loading, user };
}

// Usage example in a component:
/*
function ProtectedPage() {
  const { isAuthorized, loading } = useProtectRoute("admin");

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    return null; // Will be redirected by the hook
  }

  return <div>Protected content</div>;
}
*/