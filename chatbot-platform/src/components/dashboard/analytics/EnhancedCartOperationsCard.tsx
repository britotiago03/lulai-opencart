"use client";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import { CartOpItem, DetailedCartOpItem } from "@/types/analytics";
import { useState } from "react";

export default function EnhancedCartOperationsCard({
                                               items, 
                                               conversionRate, 
                                               extendedMetrics,
                                               detailedOperations,
                                               completedPurchases
                                           }: {
    items: CartOpItem[] | undefined;
    conversionRate?: number;
    extendedMetrics?: boolean;  // whether to show the extra grid section
    detailedOperations?: DetailedCartOpItem[] | undefined;
    completedPurchases?: number;
}) {
    const [open, setOpen] = useState(false);
    const [showDetailed, setShowDetailed] = useState(false);
    
    if (!items) return null;

    const max = items[0]?.count ?? 1;
    const addOperations = items.find(i => i.operation === "add")?.count ?? 0;
    const cartAbandonmentRate = completedPurchases !== undefined && addOperations 
        ? ((addOperations - completedPurchases) / addOperations * 100).toFixed(1)
        : "N/A";

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
                            <p className="text-sm text-gray-400">Cart Success Rate</p>
                            <p className="text-xl font-semibold">{conversionRate?.toFixed(1)}%</p>
                        </div>
                        <div className="bg-[#232b3c] p-3 rounded-md">
                            <p className="text-sm text-gray-400">Cart Add Actions</p>
                            <p className="text-xl font-semibold">{addOperations}</p>
                        </div>
                        
                        {completedPurchases !== undefined && (
                            <>
                                <div className="bg-[#232b3c] p-3 rounded-md">
                                    <p className="text-sm text-gray-400">Completed Purchases</p>
                                    <p className="text-xl font-semibold">{completedPurchases}</p>
                                </div>
                                <div className="bg-[#232b3c] p-3 rounded-md">
                                    <p className="text-sm text-gray-400">Cart Abandonment</p>
                                    <p className="text-xl font-semibold">{cartAbandonmentRate}%</p>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {detailedOperations && detailedOperations.length > 0 && (
                    <div className="mt-4">
                        <button 
                            onClick={() => setShowDetailed(!showDetailed)}
                            className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            {showDetailed ? "Hide" : "Show"} product-specific operations
                            {showDetailed ? <ChevronUp className="h-4 w-4 ml-1"/> : <ChevronDown className="h-4 w-4 ml-1"/>}
                        </button>
                        
                        {showDetailed && (
                            <div className="mt-3 bg-[#232b3c] rounded-md p-3 max-h-60 overflow-y-auto">
                                <h4 className="font-medium mb-2 text-sm text-gray-300 flex items-center">
                                    <ShoppingBag className="h-4 w-4 mr-1" />
                                    Product-specific Cart Operations
                                </h4>
                                <div className="space-y-2">
                                    {detailedOperations.map((item, idx) => (
                                        <div key={idx} className="text-sm border-b border-gray-700 pb-1 last:border-0">
                                            <div className="flex justify-between">
                                                <span className="text-gray-200 capitalize">{item.operation === 'add' ? 'Added' : item.operation === 'remove' ? 'Removed' : 'Updated'}:</span>
                                                <span className="text-gray-400">{item.count}x</span>
                                            </div>
                                            <p className="text-gray-300 truncate font-medium" 
                                              title={item.product_name || `Product ID: ${item.product_id}`}>
                                                {item.product_name && item.product_name !== item.product_id 
                                                  ? item.product_name 
                                                  : item.product_id 
                                                    ? `Product #${item.product_id}` 
                                                    : 'Unknown product'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}