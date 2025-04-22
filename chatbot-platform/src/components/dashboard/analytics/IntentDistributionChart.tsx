"use client";
import dynamic from "next/dynamic";
import { IntentItem } from "@/types/analytics";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
const PieChart = dynamic(() => import("@/components/dashboard/analytics/charts/PieChart"), { ssr: false });

export default function IntentDistribution({
                                               items
                                           }: { items: IntentItem[] | undefined }) {
    const [open, setOpen] = useState(false);
    const colors = ["#3b82f6","#8b5cf6","#06b6d4","#ec4899","#f97316"];

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
                    {items && items.length ? (
                        <PieChart
                            data={items.map(i => ({ name: i.intent ?? "unknown", value: i.count }))}
                            dataKey="value" nameKey="name" colors={colors}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            No intent data available
                        </div>
                    )}
                </div>

                {open && items && (
                    <div className="mt-4 border-t border-gray-700 pt-4 space-y-3">
                        {items.map((i, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[idx % colors.length] }}/>
                                    <span className="capitalize">{i.intent ?? "unknown"}</span>
                                </div>
                                <span className="text-gray-400">{i.count}</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
