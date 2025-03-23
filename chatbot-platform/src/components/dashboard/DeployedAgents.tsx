// src/components/dashboard/DeployedAgents.tsx
"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

interface DeployedAgentsProps {
    chatbots: any[];
}

export default function DeployedAgents({ chatbots }: DeployedAgentsProps) {
    // Take at most 3 chatbots to display
    const displayedChatbots = chatbots.slice(0, 3);

    // Generate a status for each chatbot (mocked for now)
    const getStatus = (index: number) => {
        const statuses = ["green", "amber", "red"];
        return statuses[index % statuses.length];
    };

    return (
        <Card className="bg-[#1b2539] text-white">
            <CardHeader className="p-4 sm:p-6">
                <CardTitle>Chatbot Agents Deployed</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
                    {displayedChatbots.length > 0 ? (
                        displayedChatbots.map((chatbot, index) => (
                            <Link
                                key={chatbot.id}
                                href={`/dashboard/chatbots/${chatbot.id}`}
                                className="block"
                            >
                                <div className="text-center relative">
                                    <div className="bg-gray-900 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto">
                                        <User className="text-white h-6 w-6 sm:h-8 sm:w-8" />
                                        <span
                                            className={`absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-[#1b2539] ${
                                                getStatus(index) === "green"
                                                    ? "bg-green-500"
                                                    : getStatus(index) === "amber"
                                                        ? "bg-yellow-500"
                                                        : "bg-red-500"
                                            }`}
                                        ></span>
                                    </div>
                                    <p className="mt-2 text-xs sm:text-sm font-medium truncate max-w-full">{chatbot.name}</p>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center col-span-full py-4">
                            <p className="text-gray-400">No chatbots deployed yet</p>
                            <Link
                                href="/dashboard/chatbots/create"
                                className="text-blue-400 hover:underline mt-2 inline-block text-sm"
                            >
                                Create your first chatbot
                            </Link>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}