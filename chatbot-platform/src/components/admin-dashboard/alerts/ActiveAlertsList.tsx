// components/admin-dashboard/alerts/ActiveAlertsList.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle } from "lucide-react";
import { SystemAlert } from "@/types/alerts";
import { AlertItem } from "./AlertItem";

interface ActiveAlertsListProps {
    alerts: SystemAlert[];
}

export function ActiveAlertsList({ alerts }: ActiveAlertsListProps) {
    const activeAlerts = alerts.filter(alert => !alert.resolved);

    return (
        <Card className="bg-[#1b2539] border-0">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                    <Bell className="mr-2 h-5 w-5" />
                    Active Alerts {activeAlerts.length > 0 &&
                    <Badge className="ml-2 bg-red-500/20 text-red-500">
                        {activeAlerts.length}
                    </Badge>
                }
                </CardTitle>
            </CardHeader>
            <CardContent>
                {activeAlerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <CheckCircle className="mx-auto h-12 w-12 mb-3 text-green-500" />
                        <p>No active alerts. All systems operational.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activeAlerts.map((alert) => (
                            <AlertItem key={alert.id} alert={alert} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
