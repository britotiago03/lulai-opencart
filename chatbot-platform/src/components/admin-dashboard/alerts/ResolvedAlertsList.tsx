// components/admin-dashboard/alerts/ResolvedAlertsList.tsx
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { SystemAlert } from "@/types/alerts";
import { AlertItem } from "./AlertItem";

interface ResolvedAlertsListProps {
    alerts: SystemAlert[];
}

export function ResolvedAlertsList({ alerts }: ResolvedAlertsListProps) {
    const resolvedAlerts = alerts.filter(alert => alert.resolved);

    if (resolvedAlerts.length === 0) {
        return null;
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Recently Resolved</h2>
            <Card className="bg-[#1b2539] border-0">
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {resolvedAlerts.map((alert) => (
                            <AlertItem
                                key={alert.id}
                                alert={alert}
                                showResolvedTime={true}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}