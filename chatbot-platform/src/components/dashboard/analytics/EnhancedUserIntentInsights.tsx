"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, ChevronDown, ChevronUp, MessageSquare, BarChart3 } from "lucide-react";
import { useState } from "react";
import { IntentInsight } from "@/types/analytics";
import DataVisualizationPlaceholder from "./DataVisualizationPlaceholder";

interface EnhancedUserIntentInsightsProps {
    insights?: IntentInsight[];
}

export default function EnhancedUserIntentInsights({ 
    insights
}: EnhancedUserIntentInsightsProps) {
    const [open, setOpen] = useState(false);

    // Don't use synthetic data - if no insights, show placeholder
    if (!insights || insights.length === 0) {
        return (
            <DataVisualizationPlaceholder
                title="User Intent Insights"
                description="Patterns in user conversations will appear here once your chatbot has collected data."
                icon={<Brain className="h-12 w-12 mb-3 text-purple-600/40" />}
                variant="info"
            />
        );
    }

    // Helper functions for formatting
    const getImportanceColor = (importance: string) => {
        switch (importance) {
            case "high": return "text-red-400";
            case "medium": return "text-yellow-400";
            case "low": return "text-green-400";
            default: return "text-gray-400";
        }
    };

    // Get confidence badge color
    const getConfidenceBadge = (confidence: number) => {
        const confidenceLevel = 
            confidence >= 0.9 ? "High" :
            confidence >= 0.7 ? "Medium" : "Low";
        
        const badgeColor = 
            confidence >= 0.9 ? "bg-green-900/30 text-green-400" :
            confidence >= 0.7 ? "bg-yellow-900/30 text-yellow-400" : 
            "bg-red-900/30 text-red-400";
        
        return (
            <span className={`text-xs px-2 py-0.5 rounded-full ${badgeColor}`}>
                {confidenceLevel} confidence
            </span>
        );
    };

    return (
        <Card className="bg-[#1b2539] border-0">
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <Brain className="h-5 w-5 mr-2 text-purple-400" />
                        User Intent Insights
                    </h3>
                    {insights.length > 2 && (
                        <button onClick={() => setOpen(!open)} className="text-gray-400 hover:text-white">
                            {open ? <ChevronUp className="h-5 w-5"/> : <ChevronDown className="h-5 w-5"/>}
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {insights.slice(0, open ? insights.length : Math.min(2, insights.length)).map((insight, idx) => (
                        <div key={idx} className="bg-[#232b3c] p-3 rounded-md">
                            <div className="flex items-start">
                                <MessageSquare className="h-4 w-4 mt-1 mr-2 text-blue-400" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="font-medium">{insight.insight}</p>
                                        {insight.confidence && getConfidenceBadge(insight.confidence)}
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">{insight.explanation}</p>
                                    <p className={`text-xs mt-2 ${getImportanceColor(insight.importance)}`}>
                                        {insight.importance.charAt(0).toUpperCase() + insight.importance.slice(1)} importance
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {insights.length > 2 && (
                    <button 
                        onClick={() => setOpen(!open)}
                        className="w-full mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center"
                    >
                        {open ? "Show less" : `Show ${insights.length - 2} more insights`}
                        {open ? <ChevronUp className="h-4 w-4 ml-1"/> : <ChevronDown className="h-4 w-4 ml-1"/>}
                    </button>
                )}

                {insights.length === 1 && (
                    <div className="mt-4 px-3 py-2 bg-blue-900/20 border border-blue-800/50 rounded-md flex items-center">
                        <BarChart3 className="h-4 w-4 mr-2 text-blue-500" />
                        <p className="text-xs text-gray-300">
                            More insights will appear as your chatbot collects additional conversation data.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}