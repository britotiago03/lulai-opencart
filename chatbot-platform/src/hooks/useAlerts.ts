// hooks/useAlerts.ts
'use client';

import { useEffect, useState } from "react";
import { SystemAlert } from "@/types/alerts";
import { sampleAlerts } from "@/data/sample-alerts";

export function useAlerts() {
    const [alerts, setAlerts] = useState<SystemAlert[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                // In a real implementation, fetch from an API
                // const response = await fetch('/api/admin/alerts');
                // const data = await response.json();
                // setAlerts(data);

                // For now, use sample data
                setAlerts(sampleAlerts);
            } catch (err) {
                console.error("Error fetching system alerts:", err);
                setError(err instanceof Error ? err : new Error('Unknown error occurred'));
            } finally {
                setIsLoading(false);
            }
        };

        void fetchAlerts();
    }, []);

    return { alerts, isLoading, error };
}