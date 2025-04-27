// data/sample-alerts.ts
import { SystemAlert } from "@/types/alerts";

export const sampleAlerts: SystemAlert[] = [
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
