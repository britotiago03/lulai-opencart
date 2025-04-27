// src/hooks/useSubscriptions.ts
import { useState, useEffect } from "react";
import { AdminSubscription } from "@/types/subscription";
import { fetchSubscriptions } from "@/data/subscriptions";

export default function useSubscriptions() {
    const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
    const [filteredSubscriptions, setFilteredSubscriptions] = useState<AdminSubscription[]>([]);
    const [fetchingData, setFetchingData] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [planFilter, setPlanFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch subscriptions
    useEffect(() => {
        const getSubscriptions = async () => {
            try {
                const data = await fetchSubscriptions();
                setSubscriptions(data);
                setFilteredSubscriptions(data);
            } catch (error) {
                console.error("Error fetching subscriptions:", error);
            } finally {
                setFetchingData(false);
            }
        };

        void getSubscriptions();
    }, []);

    // Apply filters when they change
    useEffect(() => {
        let result = [...subscriptions];

        // Apply status filter
        if (statusFilter !== "all") {
            result = result.filter(sub => sub.status === statusFilter);
        }

        // Apply plan filter
        if (planFilter !== "all") {
            result = result.filter(sub => sub.plan_type === planFilter);
        }

        // Apply search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(sub =>
                sub.user_name?.toLowerCase().includes(query) ||
                sub.user_email?.toLowerCase().includes(query) ||
                sub.user_id.toLowerCase().includes(query)
            );
        }

        setFilteredSubscriptions(result);
    }, [statusFilter, planFilter, searchQuery, subscriptions]);

    // Reset filters function
    const resetFilters = () => {
        setStatusFilter("all");
        setPlanFilter("all");
        setSearchQuery("");
    };

    return {
        subscriptions,
        filteredSubscriptions,
        fetchingData,
        statusFilter,
        setStatusFilter,
        planFilter,
        setPlanFilter,
        searchQuery,
        setSearchQuery,
        resetFilters
    };
}