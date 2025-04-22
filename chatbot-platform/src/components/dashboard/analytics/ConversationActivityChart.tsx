"use client";
import dynamic from "next/dynamic";
import { DailyItem } from "@/types/analytics";
const LineChart = dynamic(() => import("@/components/dashboard/analytics/charts/LineChart"), { ssr: false });

export default function ConversationActivityChart({ data }: { data: DailyItem[] }) {
    if (!data.length)
        return <div className="h-full flex items-center justify-center text-gray-500">No activity data available</div>;

    return (
        <LineChart
            data={data}
            xDataKey="date"
            yDataKey="count"
            secondaryDataKey="messages"
            primaryColor="#3b82f6"
            secondaryColor="#8b5cf6"
        />
    );
}
