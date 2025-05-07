"use client";

import { useEffect, useState } from "react";
import { DailyItem } from "@/types/analytics";
import { LineChart as ChartIcon } from "lucide-react";

// Use dynamic import with explicit client-side only rendering
import dynamic from "next/dynamic";
const SimpleLineChart = dynamic(() => import("@/components/dashboard/analytics/charts/SimpleLineChart"), {
    ssr: false,
    loading: () => <div className="h-full flex items-center justify-center text-gray-400">Loading chart...</div>
});

export default function ConversationActivityChart({ data }: { data: DailyItem[] }) {
    const [isClient, setIsClient] = useState(false);
    
    // Enable client-side rendering
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Format data for the chart
    const formatData = () => {
        if (!data || data.length === 0) return [];
        
        return data.map(item => {
            // Ensure date is properly formatted
            let formattedDate = "Unknown";
            if (typeof item.date === 'string') {
                // Try to parse and format as a date
                try {
                    const dateObj = new Date(item.date);
                    if (!isNaN(dateObj.getTime())) {
                        formattedDate = dateObj.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                        });
                    } else {
                        formattedDate = item.date;
                    }
                } catch (e) {
                    formattedDate = item.date;
                }
            }
            
            return {
                date: formattedDate,
                count: typeof item.conversation_count === 'number' 
                    ? item.conversation_count 
                    : (typeof item.count === 'number' ? item.count : 0),
                messages: typeof item.message_count === 'number' 
                    ? item.message_count 
                    : (typeof item.messages === 'number' ? item.messages : 0)
            };
        });
    };
    
    const chartData = formatData();
    
    if (!chartData.length) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <ChartIcon className="h-10 w-10 mb-2 opacity-50" />
                <p>No activity data available</p>
                <p className="text-xs mt-1">Chat with your customers to generate data</p>
            </div>
        );
    }
    
    // Make sure we only render the chart on the client
    if (!isClient) {
        return <div className="h-full flex items-center justify-center text-gray-400">Loading chart...</div>;
    }

    return (
        <SimpleLineChart
            data={chartData}
            primaryColor="#3b82f6"
            secondaryColor="#8b5cf6"
        />
    );
}
