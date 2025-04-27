// admin/alerts/page.tsx
"use client";

import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAlerts } from "@/hooks/useAlerts";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { ActiveAlertsList } from "@/components/admin-dashboard/alerts/ActiveAlertsList";
import { ResolvedAlertsList } from "@/components/admin-dashboard/alerts/ResolvedAlertsList";

export default function AdminAlertsPage() {
    const { isLoading: authLoading, isAdmin } = useAdminAuth();
    const { alerts, isLoading: alertsLoading, error } = useAlerts();

    // Show loading while checking auth or fetching alerts
    if (authLoading || alertsLoading) {
        return <LoadingSkeleton />;
    }

    // Safety check - don't render for non-admins
    if (!isAdmin) {
        return null;
    }

    // Handle error state
    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="p-4 bg-red-500/20 text-red-400 rounded-lg">
                    <h2 className="text-lg font-semibold">Error Loading Alerts</h2>
                    <p>{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">System Alerts</h1>
                <p className="text-gray-400 mt-1">
                    Monitor and manage system alerts and notifications
                </p>
            </div>

            <div className="mb-8">
                <ActiveAlertsList alerts={alerts} />
            </div>

            <ResolvedAlertsList alerts={alerts} />
        </div>
    );
}