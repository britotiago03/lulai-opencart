// lib/alert-utils.ts
import { SystemAlert } from "@/types/alerts";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

export const getAlertProperties = (type: SystemAlert["type"]) => {
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

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
};