"use client";
import { Card, CardContent } from "@/components/ui/card";
import { GitBranch, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { ConversationFlowStep } from "@/types/analytics";

interface ConversationFlowCardProps {
    data?: ConversationFlowStep[];
}

// Default flow steps are now defined in the conversationAnalyzer.ts file
// and will be used as fallback if the API doesn't return any flow data

export default function ConversationFlowCard({ data }: ConversationFlowCardProps) {
    const [open, setOpen] = useState(false);

    if (!data || data.length === 0) {
        return (
            <Card className="bg-[#1b2539] border-0">
                <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold flex items-center">
                            <GitBranch className="h-5 w-5 mr-2 text-green-400" />
                            Conversation Flow
                        </h3>
                    </div>
                    <div className="flex flex-col items-center justify-center text-gray-500 py-6">
                        <AlertTriangle className="h-10 w-10 mb-2 opacity-50" />
                        <p>Not enough conversation data to generate flow</p>
                        <p className="text-xs mt-1">Flow analysis will appear as users interact with your chatbot</p>
                    </div>
                </CardContent>
            </Card>
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
                    <button onClick={() => setOpen(!open)} className="text-gray-400 hover:text-white">
                        {open ? <ChevronUp className="h-5 w-5"/> : <ChevronDown className="h-5 w-5"/>}
                    </button>
                </div>

                <div className="relative">
                    {/* Vertical flow line */}
                    <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-700 z-0"></div>

                    {/* Flow steps */}
                    <div className="space-y-6 relative z-10">
                        {data.slice(0, open ? data.length : 4).map((step, idx) => (
                            <div key={idx} className="flex items-start">
                                <div 
                                    className="w-8 h-8 rounded-full flex items-center justify-center mr-3 z-10"
                                    style={{ backgroundColor: step.color || "#3b82f6" }}
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
                                                backgroundColor: step.color || "#3b82f6"
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
            </CardContent>
        </Card>
    );
}