// src/components/dashboard/ConversationsSection.tsx
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { Conversation } from "@/types/dashboard";

interface ConversationListProps {
    conversations: Conversation[];
}

function ConversationList({ conversations }: ConversationListProps) {
    return (
        <div className="space-y-4">
            {conversations.map((convo) => (
                <Link key={convo.id} href={`/dashboard/conversations/${convo.id}`}>
                    <div className="border border-gray-700 rounded-lg p-4 hover:bg-[#232b3c] transition-colors cursor-pointer">
                        <div className="flex justify-between mb-2">
                            <div className="flex items-center text-sm text-gray-400">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                {new Date(convo.created_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </div>
                            <div className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full">
                                {convo.chatbot_name}
                            </div>
                        </div>
                        <p className="font-medium truncate">{convo.message_content}</p>
                        <p className="text-sm text-gray-400 mt-2">
                            User: {convo.user_id}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
}

function EmptyConversationsState() {
    return (
        <div className="text-center">
            <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No Conversations Yet</h3>
            <p className="text-gray-400 mb-6">
                When your chatbot starts engaging with users, conversations will appear here
            </p>
        </div>
    );
}

interface ConversationsSectionProps {
    conversations: Conversation[];
    showEmptyState: boolean;
}

export default function ConversationsSection({
                                                 conversations,
                                                 showEmptyState
                                             }: ConversationsSectionProps) {
    const hasConversations = conversations && conversations.length > 0;

    if (!hasConversations && !showEmptyState) {
        return null;
    }

    return (
        <Card className="bg-[#1b2539] border-0 mt-6">
            <CardContent className="p-4 sm:p-6">
                {hasConversations ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Recent Conversations</h3>
                            <Link
                                href={`/dashboard/conversations`}
                                className="text-sm text-blue-500 hover:text-blue-400"
                            >
                                View All →
                            </Link>
                        </div>
                        <ConversationList conversations={conversations} />
                    </>
                ) : (
                    <EmptyConversationsState />
                )}
            </CardContent>
        </Card>
    );
}