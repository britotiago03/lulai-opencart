// lib/hooks/useAdminAuth.ts
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAdminAuth({
                                 requiredAdmin = true,
                                 redirectTo = '/admin/signin'
                             } = {}) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const res = await fetch('/api/admin-auth/session');
                const session = await res.json();

                console.log('Admin session check:', session);

                const userIsAdmin = session?.user?.isAdmin === true;
                setIsAdmin(userIsAdmin);

                if (requiredAdmin && !userIsAdmin) {
                    console.log('Not admin, redirecting to:', redirectTo);
                    router.push(redirectTo);
                }
            } catch (error) {
                console.error('Failed to check admin status:', error);
                if (requiredAdmin) {
                    router.push(redirectTo);
                }
            } finally {
                setIsLoading(false);
            }
        };

        void checkAdminStatus();
    }, [requiredAdmin, redirectTo, router]);

    return { isLoading, isAdmin };
}