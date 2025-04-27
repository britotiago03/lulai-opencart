// src/hooks/useAdminLogout.ts
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useAdminLogout() {
    const router = useRouter();

    const logout = async () => {
        try {
            // 1. First clear all auth-related cookies with multiple approaches
            const cookiesToClear = [
                "admin-session-token",
                "admin-session",
                "next-auth.admin-session-token",
                "next-auth.csrf-token",
                "next-auth.callback-url",
                "next-auth.state",
                // Also clear regular auth cookies to be thorough
                "next-auth.session-token",
                "user-session-token",
                "user-session"
            ];

            // Clear cookies with various paths to ensure they're all removed
            const paths = ["/", "/admin", "/api", "/api/admin-auth", "/api/auth"];

            cookiesToClear.forEach(cookieName => {
                paths.forEach(path => {
                    document.cookie = `${cookieName}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=strict`;
                    // Also try without secure flag for local development
                    document.cookie = `${cookieName}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:01 GMT; samesite=lax`;
                });
            });

            // 2. Call the specific admin-auth signout endpoint directly with fetch
            try {
                // Get CSRF token first
                const csrfResponse = await fetch('/api/admin-auth/csrf');
                const { csrfToken } = await csrfResponse.json();

                // Call admin signout endpoint
                await fetch('/api/admin-auth/signout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        csrfToken,
                        callbackUrl: '/',
                        json: true
                    }),
                    credentials: 'include'
                });
            } catch {
                console.log("Admin signout API call failed, continuing with fallback");
            }

            // 3. Also call the standard NextAuth signOut with both API paths
            // First try with admin-auth path
            try {
                await signOut({
                    redirect: false,
                    callbackUrl: '/'
                });
            } catch {
                console.log("Standard signout failed, continuing with fallback");
            }

            // 4. Clear any session storage
            sessionStorage.clear();

            // 5. Clear any local storage related to auth
            const localStorageKeysToRemove = [
                'nextauth.message',
                'admin.session',
                'admin.token',
                'user.session',
                'user.token'
            ];

            localStorageKeysToRemove.forEach(key => {
                try {
                    localStorage.removeItem(key);
                } catch {
                    // Ignore errors with localStorage
                }
            });

            // 6. Force navigation out of admin area
            router.push("/");

            // 7. Force a complete page reload after a small delay to ensure everything is reset
            setTimeout(() => {
                window.location.href = "/";
            }, 100);
        } catch (error) {
            console.error("Error during admin logout:", error);
            // Final fallback: just reload the home page
            window.location.href = "/";
        }
    };

    return { logout };
}