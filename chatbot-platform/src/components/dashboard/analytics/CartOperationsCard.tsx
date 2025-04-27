"use client";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CartOpItem } from "@/types/analytics";
import { useState } from "react";

export default function CartOperationsCard({
                                               items, conversionRate, extendedMetrics
                                           }: {
    items: CartOpItem[] | undefined;
    conversionRate?: number;
    extendedMetrics?: boolean;  // whether to show the extra grid section
}) {
    const [open, setOpen] = useState(false);
    if (!items) return null;

    const max = items[0]?.count ?? 1;

    return (
        <Card className="bg-[#1b2539] border-0">
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Cart Operations</h3>
                    <button onClick={() => setOpen(!open)} className="text-gray-400 hover:text-white">
                        {open ? <ChevronUp className="h-5 w-5"/> : <ChevronDown className="h-5 w-5"/>}
                    </button>
                </div>

                {items.length ? (
                    <div className="space-y-4">
                        {items.map((op, idx) => (
                            <div key={idx} className="flex items-center">
                                <div className="w-8 h-8 bg-[#232b3c] rounded-full flex items-center justify-center mr-3">
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <p className="font-medium capitalize">{op.operation}</p>
                                        <p className="text-gray-400">{op.count}</p>
                                    </div>
                                    <div className="w-full bg-[#232b3c] rounded-full h-2">
                                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(op.count / max) * 100}%` }}/>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <div className="text-gray-500 text-center py-8">No cart operations data</div>}

                {open && extendedMetrics && (
                    <div className="mt-6 border-t border-gray-700 pt-4 grid grid-cols-2 gap-4">
                        <div className="bg-[#232b3c] p-3 rounded-md">
                            <p className="text-sm text-gray-400">Success Rate</p>
                            <p className="text-xl font-semibold">{conversionRate?.toFixed(1)}%</p>
                        </div>
                        <div className="bg-[#232b3c] p-3 rounded-md">
                            <p className="text-sm text-gray-400">Cart Add Actions</p>
                            <p className="text-xl font-semibold">
                                {items.find(i => i.operation === "add")?.count ?? 0}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
