// components/admin-dashboard/alerts/AlertItem.tsx
'use client';

import { Badge } from "@/components/ui/badge";
import { SystemAlert } from "@/types/alerts";
import { formatDate, getAlertProperties } from "@/lib/alert-utils";

interface AlertItemProps {
    alert: SystemAlert;
    showResolvedTime?: boolean;
}

export function AlertItem({ alert, showResolvedTime = false }: AlertItemProps) {
    const { icon: AlertIcon, bgColor, textColor, badgeColor } = getAlertProperties(alert.type);

    return (
        <div className={`p-4 bg-[#232b3c] rounded-lg ${alert.resolved ? "opacity-70" : ""}`}>
            <div className="flex items-start">
                <div className={`p-2 rounded-full ${bgColor} mr-3`}>
                    <AlertIcon className={`h-5 w-5 ${textColor}`} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-medium">{alert.title}</h3>
                        <Badge className={alert.resolved ? "bg-green-500/20 text-green-500" : badgeColor}>
                            {alert.resolved ? "RESOLVED" : alert.type.toUpperCase()}
                        </Badge>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{alert.message}</p>
                    <div className="mt-2 text-xs text-gray-500">
                        {showResolvedTime && alert.resolved ?
                            `Resolved: ${alert.resolved_at ? formatDate(alert.resolved_at) : "Unknown"}` :
                            `Detected: ${formatDate(alert.created_at)}`
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
