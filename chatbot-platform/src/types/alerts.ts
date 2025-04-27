// types/alerts.ts
export interface SystemAlert {
    id: string;
    type: "warning" | "error" | "info" | "success";
    title: string;
    message: string;
    created_at: string;
    resolved: boolean;
    resolved_at?: string;
}