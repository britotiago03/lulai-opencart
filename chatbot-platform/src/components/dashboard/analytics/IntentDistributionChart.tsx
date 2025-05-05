"use client";
import dynamic from "next/dynamic";
import { IntentItem } from "@/types/analytics";
import { ChevronDown, ChevronUp, PieChart as PieChartIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";

const SimplePieChart = dynamic(() => import("@/components/dashboard/analytics/charts/SimplePieChart"), { 
    ssr: false,
    loading: () => <div className="h-full flex items-center justify-center text-gray-400">Loading chart...</div>
});

export default function IntentDistribution({
    items
}: { items: IntentItem[] | undefined }) {
    const [open, setOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const colors = ["#3b82f6","#8b5cf6","#06b6d4","#ec4899","#f97316"];

    // Enable client-side rendering
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Check if we have valid data
    const validItems = items?.filter(i => i.count > 0) || [];
    const hasValidData = validItems.length > 0;

    return (
        <Card className="bg-[#1b2539] border-0">
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Intent Distribution</h3>
                    <button onClick={() => setOpen(!open)} className="text-gray-400 hover:text-white">
                        {open ? <ChevronUp className="h-5 w-5"/> : <ChevronDown className="h-5 w-5"/>}
                    </button>
                </div>

                <div className="h-80 w-full">
                    {!isClient ? (
                        <div className="h-full flex items-center justify-center text-gray-400">Loading chart...</div>
                    ) : hasValidData ? (
                        <SimplePieChart
                            data={validItems}
                            colors={colors}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <PieChartIcon className="h-10 w-10 mb-2 opacity-50" />
                            <p>No intent data available</p>
                            <p className="text-xs mt-1">Chat with your customers to generate data</p>
                        </div>
                    )}
                </div>

                {open && hasValidData && (
                    <div className="mt-4 border-t border-gray-700 pt-4 space-y-3">
                        {validItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[idx % colors.length] }}/>
                                    <span className="capitalize">{formatIntentName(item.intent ?? "unknown")}</span>
                                </div>
                                <span className="text-gray-400">{item.count}</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Helper function to format intent names
function formatIntentName(name: string): string {
    let formattedName = name.replace(/_/g, ' ');
    
    switch (formattedName) {
        case 'cart_add': return 'Add to Cart';
        case 'product_view': return 'View Product';
        case 'navigate': return 'Navigation';
        case 'question': return 'Question';
        case 'other': return 'Other';
        default:
            return formattedName
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
    }
}
