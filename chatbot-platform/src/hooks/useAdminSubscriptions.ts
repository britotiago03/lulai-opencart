"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AdminSubscription } from '@/types/subscription';
import { sampleSubscriptions } from '@/data/subscriptions';

export function useAdminSubscriptions() {
    const { data: session, status } = useSession();
    const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSubscriptions() {
            // Only fetch if authenticated
            if (status === 'authenticated') {
                try {
                    setLoading(true);
                    // Fetch all subscriptions
                    const response = await fetch('/api/admin/subscriptions', {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setSubscriptions(data.subscriptions || []);
                        setError(null);
                    } else {
                        // If API fails, use sample data for demo purposes
                        console.error('Error fetching subscriptions:', await response.text());
                        setSubscriptions(sampleSubscriptions);
                        setError("Using sample data (could not fetch from API)");
                    }
                } catch (err) {
                    console.error('Error fetching subscriptions:', err);
                    // Fallback to sample data
                    setSubscriptions(sampleSubscriptions);
                    setError("Using sample data (API request failed)");
                } finally {
                    setLoading(false);
                }
            } else if (status === 'unauthenticated') {
                // If not authenticated, use sample data
                setSubscriptions(sampleSubscriptions);
                setError("Using sample data (not authenticated)");
                setLoading(false);
            }
        }

        if (status !== 'loading') {
            void fetchSubscriptions();
        }
    }, [status]);

    return {
        subscriptions,
        loading: loading || status === 'loading',
        error,
        isAuthenticated: status === 'authenticated',
    };
}