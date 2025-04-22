// src/components/admin-dashboard/chatbots/StatusBadge.tsx
import { CheckCircle, AlertTriangle } from "lucide-react";

interface StatusBadgeProps {
    status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    switch (status) {
        case "active":
            return (
                <span className="flex items-center px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-full">
                    <CheckCircle className="h-3 w-3 mr-1" /> Active
                </span>
            );
        case "inactive":
            return (
                <span className="flex items-center px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-full">
                    Inactive
                </span>
            );
        case "error":
            return (
                <span className="flex items-center px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded-full">
                    <AlertTriangle className="h-3 w-3 mr-1" /> Error
                </span>
            );
        default:
            return (
                <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-full">
                    Unknown
                </span>
            );
    }
}