import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { MessageSquare, Activity, Settings } from "lucide-react";
import { Chatbot } from "@/app/dashboard/agents/page";

export default function AgentCard({ chatbot }: { chatbot: Chatbot }) {
    return (
        <Card className="bg-[#1b2539] border-0 hover:bg-[#232b3c] transition-all">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold">{chatbot.name}</h3>
                    <div className="px-2 py-1 text-xs bg-blue-900/30 text-blue-400 rounded-full">
                        {chatbot.industry}
                    </div>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                    {chatbot.description || `Chatbot agent for ${chatbot.platform}`}
                </p>
                <div className="mb-6 text-xs text-gray-500">
                    Created on {new Date(chatbot.created_at).toLocaleDateString()}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Link
                        href={`/dashboard/conversations?chatbotId=${chatbot.id}`}
                        className="flex items-center justify-center py-2 px-3 bg-[#232b3c] hover:bg-[#2a3349] rounded-md"
                    >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Conversations
                    </Link>
                    <Link
                        href={`/dashboard/analytics?chatbotId=${chatbot.id}`}
                        className="flex items-center justify-center py-2 px-3 bg-[#232b3c] hover:bg-[#2a3349] rounded-md"
                    >
                        <Activity className="h-4 w-4 mr-2" />
                        Analytics
                    </Link>
                    <Link
                        href={`/dashboard/agents/${chatbot.id}/settings`}
                        className="flex items-center justify-center py-2 px-3 bg-[#232b3c] hover:bg-[#2a3349] rounded-md col-span-2"
                    >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
