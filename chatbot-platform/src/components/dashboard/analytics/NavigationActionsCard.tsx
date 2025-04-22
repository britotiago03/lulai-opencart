"use client";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { NavAction } from "@/types/analytics";
import { useState } from "react";

export default function NavigationActionsCard({
                                                  items
                                              }: { items: NavAction[] | undefined }) {
    const [open, setOpen] = useState(false);
    if (!items) return null;

    const max = items[0]?.count ?? 1;

    return (
        <Card className="bg-[#1b2539] border-0">
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Navigation Actions</h3>
                    <button onClick={() => setOpen(!open)} className="text-gray-400 hover:text-white">
                        {open ? <ChevronUp className="h-5 w-5"/> : <ChevronDown className="h-5 w-5"/>}
                    </button>
                </div>

                {items.length ? (
                    <div className="space-y-4">
                        {items.map((nav, idx) => (
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
                ) : <div className="text-gray-500 text-center py-8">No navigation data</div>}

                {open && (
                    <div className="mt-6 border-t border-gray-700 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {items.slice(0,4).map((n,i)=>(
                            <div key={i} className="bg-[#232b3c] p-2 rounded flex justify-between items-center">
                                <span className="text-sm">{n.target}</span>
                                <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full">{n.count}</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
