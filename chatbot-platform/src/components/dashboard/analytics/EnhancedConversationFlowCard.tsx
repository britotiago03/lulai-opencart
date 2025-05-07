"use client";
import { Card, CardContent } from "@/components/ui/card";
import { GitBranch, ChevronDown, ChevronUp, BarChart3 } from "lucide-react";
import { useState } from "react";
import { ConversationFlowStep } from "@/types/analytics";
import DataVisualizationPlaceholder from "./DataVisualizationPlaceholder";

interface EnhancedConversationFlowCardProps {
    data?: ConversationFlowStep[];
}

// Color palette for flow steps
const FLOW_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#10b981", // green
  "#f97316", // orange
  "#ef4444", // red
  "#6366f1", // indigo
  "#ec4899", // pink
  "#14b8a6", // teal
];

export default function EnhancedConversationFlowCard({ 
    data
}: EnhancedConversationFlowCardProps) {
    const [open, setOpen] = useState(false);

    // Don't use synthetic data - if no flow data, show placeholder
    if (!data || data.length === 0) {
        return (
            <DataVisualizationPlaceholder
                title="Conversation Flow"
                description="User conversation journey patterns will appear here as your chatbot collects data."
                icon={<GitBranch className="h-12 w-12 mb-3 text-green-600/40" />}
                variant="info"
            />
        );
    }

    return (
        <Card className="bg-[#1b2539] border-0">
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <GitBranch className="h-5 w-5 mr-2 text-green-400" />
                        Conversation Flow
                    </h3>
                    {data.length > 4 && (
                        <button onClick={() => setOpen(!open)} className="text-gray-400 hover:text-white">
                            {open ? <ChevronUp className="h-5 w-5"/> : <ChevronDown className="h-5 w-5"/>}
                        </button>
                    )}
                </div>

                <div className="relative">
                    {/* Vertical flow line */}
                    <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-700 z-0"></div>

                    {/* Flow steps */}
                    <div className="space-y-6 relative z-10">
                        {data.slice(0, open ? data.length : Math.min(4, data.length)).map((step, idx) => (
                            <div key={idx} className="flex items-start">
                                <div 
                                    className="w-8 h-8 rounded-full flex items-center justify-center mr-3 z-10"
                                    style={{ backgroundColor: step.color || FLOW_COLORS[idx % FLOW_COLORS.length] }}
                                >
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <p className="font-medium">{step.step}</p>
                                        <p className="text-gray-400">{step.percentage}%</p>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-2">{step.description}</p>
                                    <div className="w-full bg-[#232b3c] rounded-full h-2">
                                        <div 
                                            className="h-2 rounded-full" 
                                            style={{ 
                                                width: `${step.percentage}%`,
                                                backgroundColor: step.color || FLOW_COLORS[idx % FLOW_COLORS.length]
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {data.length > 4 && (
                    <button 
                        onClick={() => setOpen(!open)}
                        className="w-full mt-5 text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center"
                    >
                        {open ? "Show less" : `Show ${data.length - 4} more steps`}
                        {open ? <ChevronUp className="h-4 w-4 ml-1"/> : <ChevronDown className="h-4 w-4 ml-1"/>}
                    </button>
                )}

                {data.length === 1 && (
                    <div className="mt-4 px-3 py-2 bg-blue-900/20 border border-blue-800/50 rounded-md flex items-center">
                        <BarChart3 className="h-4 w-4 mr-2 text-blue-500" />
                        <p className="text-xs text-gray-300">
                            More flow steps will appear as your chatbot collects additional conversation data.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}