import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, ChevronRight } from "lucide-react";
import { Conversation } from "@/types/conversation";

export default function AdminConversationCard({ convo }: { convo: Conversation }) {
    return (
        <Link href={`/admin/conversations/thread/${convo.threadId || `${convo.user_id}-${convo.api_key}`}`}>
            <Card className="bg-[#1b2539] border-0 hover:bg-[#232b3c] transition-colors cursor-pointer">
                <CardContent className="p-4">
                    <div className="flex justify-between mb-2">
                        <div className="flex items-center text-sm text-gray-400">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {new Date(convo.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </div>
                        <div className="flex items-center">
                            <div className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full mr-2">
                                {convo.messageCount || 1} messages
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                        </div>
                    </div>
                    <p className="font-medium truncate">{convo.message_content}</p>
                    <div className="flex justify-between mt-2 text-sm text-gray-400">
                        <p>User: {convo.user_id}</p>
                        {convo.chatbot_name && (
                            <p>Chatbot: {convo.chatbot_name}</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}