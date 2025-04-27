"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, CheckCircle, Info } from "lucide-react";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";

// Types for system alerts
interface SystemAlert {
    id: string;
    type: "warning" | "error" | "info" | "success";
    title: string;
    message: string;
    created_at: string;
    resolved: boolean;
    resolved_at?: string;
}

export default function AdminAlertsPage() {
    const { isLoading, isAdmin } = useAdminAuth();
    const [alerts, setAlerts] = useState<SystemAlert[]>([]);
    const [fetchingAlerts, setFetchingAlerts] = useState(true);

    // Example alerts - in a real app, these would come from an API
    const sampleAlerts: SystemAlert[] = [
        {
            id: "1",
            type: "warning",
            title: "High API Usage Detected",
            message: "User ID 45678 has exceeded 90% of their monthly API quota.",
            created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            resolved: false,
        },
        {
            id: "2",
            type: "error",
            title: "Database Connection Error",
            message: "Temporary connection issue with the analytics database detected.",
            created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
            resolved: true,
            resolved_at: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
        },
        {
            id: "3",
            type: "info",
            title: "System Maintenance",
            message: "Scheduled maintenance will occur tomorrow at 2:00 AM UTC.",
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            resolved: false,
        },
    ];

    useEffect(() => {
        // Only fetch alerts after we've confirmed admin status
        if (!isLoading && isAdmin) {
            const fetchAlerts = async () => {
                try {
                    // In a real implementation, fetch from an API
                    // const response = await fetch('/api/admin/alerts');
                    // const data = await response.json();
                    // setAlerts(data);

                    // For now, use sample data
                    setAlerts(sampleAlerts);
                } catch (error) {
                    console.error("Error fetching system alerts:", error);
                } finally {
                    setFetchingAlerts(false);
                }
            };

            void fetchAlerts();
        }
    }, [isLoading, isAdmin]);

    // Show loading while checking auth or fetching alerts
    if (isLoading || fetchingAlerts) {
        return <LoadingSkeleton />;
    }

    // Safety check - don't render for non-admins
    if (!isAdmin) {
        return null;
    }

    // Helper function to get icon and color based on alert type
    const getAlertProperties = (type: SystemAlert["type"]) => {
        switch (type) {
            case "warning":
                return {
                    icon: AlertTriangle,
                    bgColor: "bg-amber-600/20",
                    textColor: "text-amber-500",
                    badgeColor: "bg-amber-500/20 text-amber-500"
                };
            case "error":
                return {
                    icon: AlertTriangle,
                    bgColor: "bg-red-600/20",
                    textColor: "text-red-500",
                    badgeColor: "bg-red-500/20 text-red-500"
                };
            case "success":
                return {
                    icon: CheckCircle,
                    bgColor: "bg-green-600/20",
                    textColor: "text-green-500",
                    badgeColor: "bg-green-500/20 text-green-500"
                };
            case "info":
            default:
                return {
                    icon: Info,
                    bgColor: "bg-blue-600/20",
                    textColor: "text-blue-500",
                    badgeColor: "bg-blue-500/20 text-blue-500"
                };
        }
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const activeAlerts = alerts.filter(alert => !alert.resolved);
    const resolvedAlerts = alerts.filter(alert => alert.resolved);

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">System Alerts</h1>
                <p className="text-gray-400 mt-1">
                    Monitor and manage system alerts and notifications
                </p>
            </div>

            <div className="mb-8">
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
                                {activeAlerts.map((alert) => {
                                    const { icon: AlertIcon, bgColor, textColor, badgeColor } = getAlertProperties(alert.type);
                                    return (
                                        <div key={alert.id} className="p-4 bg-[#232b3c] rounded-lg">
                                            <div className="flex items-start">
                                                <div className={`p-2 rounded-full ${bgColor} mr-3`}>
                                                    <AlertIcon className={`h-5 w-5 ${textColor}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-medium">{alert.title}</h3>
                                                        <Badge className={badgeColor}>
                                                            {alert.type.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-gray-400 text-sm mt-1">{alert.message}</p>
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        Detected: {formatDate(alert.created_at)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {resolvedAlerts.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Recently Resolved</h2>
                    <Card className="bg-[#1b2539] border-0">
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {resolvedAlerts.map((alert) => {
                                    const { icon: AlertIcon, bgColor, textColor } = getAlertProperties(alert.type);
                                    return (
                                        <div key={alert.id} className="p-4 bg-[#232b3c] rounded-lg opacity-70">
                                            <div className="flex items-start">
                                                <div className={`p-2 rounded-full ${bgColor} mr-3`}>
                                                    <AlertIcon className={`h-5 w-5 ${textColor}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-medium">{alert.title}</h3>
                                                        <Badge className="bg-green-500/20 text-green-500">
                                                            RESOLVED
                                                        </Badge>
                                                    </div>
                                                    <p className="text-gray-400 text-sm mt-1">{alert.message}</p>
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        Resolved: {alert.resolved_at ? formatDate(alert.resolved_at) : "Unknown"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}