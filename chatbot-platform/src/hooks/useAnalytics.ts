import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnalyticsData } from "@/types/analytics";
import { useSession } from "next-auth/react";

export function useAnalytics() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const chatbotId = searchParams.get("chatbotId");

    const [timeRange, setTimeRange]     = useState<"7" | "30" | "90">("30");
    const [data,       setData]         = useState<AnalyticsData | null>(null);
    const [loading,    setLoading]      = useState(true);
    const [error,      setError]        = useState<string | null>(null);

    const buildApiUrl = useCallback(
        () => `/api/analytics?timeRange=${timeRange}${chatbotId ? `&chatbotId=${chatbotId}` : ""}`,
        [timeRange, chatbotId]
    );

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(buildApiUrl());

            if (!res.ok) {
                const errorMessage = `HTTP error ${res.status}`;
                setError(errorMessage);
                return;
            }

            setData(await res.json());
            setError(null);
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : "Unknown error";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [buildApiUrl]);

    // initial / param change load
    useEffect(() => {
        if (status === "unauthenticated") router.push("/auth/signin");
        if (status === "authenticated")   void fetchData();
    }, [status, timeRange, chatbotId, fetchData, router]);

    return { session, chatbotId, data, loading, error, timeRange, setTimeRange, refresh: fetchData };
}