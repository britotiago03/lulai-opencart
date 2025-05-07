"use client";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ChevronDown, ChevronUp, Navigation2, BarChart2 } from "lucide-react";
import { NavAction, DetailedNavAction } from "@/types/analytics";
import { useState } from "react";
import DataVisualizationPlaceholder from "./DataVisualizationPlaceholder";

export default function ImprovedNavigationActionsCard({
    items,
    detailedActions
}: {
    items?: NavAction[];
    detailedActions?: DetailedNavAction[];
}) {
    const [open, setOpen] = useState(false);
    const [showDetailed, setShowDetailed] = useState(false);

    // Don't use synthetic data - if no items, show placeholder
    if (!items || items.length === 0) {
        return (
            <DataVisualizationPlaceholder
                title="Navigation Actions"
                description="User navigation patterns will appear here as your chatbot collects data."
                icon={<Navigation2 className="h-12 w-12 mb-3 text-blue-600/40" />}
                variant="info"
            />
        );
    }

    const max = items[0]?.count ?? 1;

    return (
        <Card className="bg-[#1b2539] border-0">
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <Navigation2 className="h-5 w-5 mr-2 text-blue-400" />
                        Navigation Actions
                    </h3>
                    {items.length > 4 && (
                        <button onClick={() => setOpen(!open)} className="text-gray-400 hover:text-white">
                            {open ? <ChevronUp className="h-5 w-5"/> : <ChevronDown className="h-5 w-5"/>}
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {items.slice(0, open ? items.length : Math.min(4, items.length)).map((nav, idx) => (
                        <div key={idx} className="flex items-center">
                            <div className="w-8 h-8 bg-[#232b3c] rounded-full flex items-center justify-center mr-3">
                                <ArrowRight className="h-4 w-4"/>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <p className="font-medium">{nav.target}</p>
                                    <p className="text-gray-400">{nav.count}</p>
                                </div>
                                <div className="w-full bg-[#232b3c] rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(nav.count / max) * 100}%` }}/>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {items.length > 4 && (
                    <button 
                        onClick={() => setOpen(!open)}
                        className="w-full mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center"
                    >
                        {open ? "Show less" : `Show ${items.length - 4} more actions`}
                        {open ? <ChevronUp className="h-4 w-4 ml-1"/> : <ChevronDown className="h-4 w-4 ml-1"/>}
                    </button>
                )}

                {detailedActions && detailedActions.length > 0 ? (
                    <div className="mt-4">
                        <button 
                            onClick={() => setShowDetailed(!showDetailed)}
                            className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            {showDetailed ? "Hide" : "Show"} product-specific navigation
                            {showDetailed ? <ChevronUp className="h-4 w-4 ml-1"/> : <ChevronDown className="h-4 w-4 ml-1"/>}
                        </button>
                        
                        {showDetailed && (
                            <div className="mt-3 bg-[#232b3c] rounded-md p-3 max-h-60 overflow-y-auto">
                                <h4 className="font-medium mb-2 text-sm text-gray-300 flex items-center">
                                    <ArrowRight className="h-4 w-4 mr-1" />
                                    Product-specific Navigation Actions
                                </h4>
                                <div className="space-y-2">
                                    {detailedActions.map((item, idx) => (
                                        <div key={idx} className="text-sm border-b border-gray-700 pb-1 last:border-0">
                                            <div className="flex justify-between">
                                                <span className="text-gray-200">Navigated to: <strong>{item.target}</strong></span>
                                                <span className="text-gray-400">{item.count}x</span>
                                            </div>
                                            {item.product_name && (
                                                <p className="text-gray-300 truncate font-medium" 
                                                  title={item.product_name || `Product ID: ${item.product_id}`}>
                                                    {item.product_name && item.product_name !== item.product_id 
                                                      ? item.product_name 
                                                      : item.product_id 
                                                        ? `Product #${item.product_id}` 
                                                        : 'Unknown page'}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}

                {items.length === 1 && (
                    <div className="mt-4 px-3 py-2 bg-blue-900/20 border border-blue-800/50 rounded-md flex items-center">
                        <BarChart2 className="h-4 w-4 mr-2 text-blue-500" />
                        <p className="text-xs text-gray-300">
                            More navigation patterns will appear as your chatbot collects additional data.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}