import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { Conversation } from "@/hooks/useConversations";

export default function ConversationCard({ convo }: { convo: Conversation }) {
    return (
        <Link href={`/dashboard/conversations/thread/${convo.threadId}`}>
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
                        <div className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full">
                            {convo.messageCount} messages
                        </div>
                    </div>
                    <p className="font-medium truncate">{convo.message_content}</p>
                    <p className="text-sm text-gray-400 mt-2">
                        User: {convo.user_id}
                        {convo.chatbot_name && ` • Via: ${convo.chatbot_name}`}
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
}
