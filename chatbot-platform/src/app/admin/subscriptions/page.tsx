"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { fetchSubscriptions } from "@/data/subscriptions";
import { AdminSubscription } from "@/types/subscription";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import SubscriptionStats from "@/components/admin-dashboard/subscriptions/SubscriptionStats";
import SubscriptionFilters from "@/components/admin-dashboard/subscriptions/SubscriptionFilters";
import SubscriptionTable from "@/components/admin-dashboard/subscriptions/SubscriptionTable";
import { updateFiltersAction } from "./actions";

export default function AdminSubscriptionsPage() {
    const { isLoading, isAdmin } = useAdminAuth();
    const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
    const [filteredSubscriptions, setFilteredSubscriptions] = useState<AdminSubscription[]>([]);
    const [fetchingData, setFetchingData] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [planFilter, setPlanFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch subscriptions
    useEffect(() => {
        // Only fetch data after we've confirmed admin status
        if (!isLoading && isAdmin) {
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
        }
    }, [isLoading, isAdmin]);

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

    // Custom action that wraps the server action but also updates local state
    const handleUpdateFilters = async (status: string, plan: string, search: string) => {
        // Update local state
        setStatusFilter(status);
        setPlanFilter(plan);
        setSearchQuery(search);

        // Call the server action
        await updateFiltersAction(status, plan, search);
    };

    // Show loading while checking auth or fetching data
    if (isLoading || fetchingData) {
        return <LoadingSkeleton />;
    }

    // Safety check - don't render for non-admins
    if (!isAdmin) {
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Subscription Management</h1>
                <p className="text-gray-400 mt-1">
                    View and manage user subscriptions and payment details
                </p>
            </div>

            {/* Stats Cards */}
            <SubscriptionStats subscriptions={filteredSubscriptions} />

            {/* Filters and Search */}
            <SubscriptionFilters
                initialStatusFilter={statusFilter}
                initialPlanFilter={planFilter}
                initialSearchQuery={searchQuery}
                updateFiltersAction={handleUpdateFilters}
            />

            {/* Subscriptions Table */}
            <SubscriptionTable subscriptions={filteredSubscriptions} />
        </div>
    );
}