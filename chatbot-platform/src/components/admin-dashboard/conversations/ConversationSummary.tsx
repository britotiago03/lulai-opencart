// src/components/admin-dashboard/conversations/ConversationSummary.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Message, ChatbotInfo } from "@/types/conversation";

interface ConversationSummaryProps {
    messages: Message[];
    chatbotInfo: ChatbotInfo | null;
}

export default function ConversationSummary({ messages, chatbotInfo }: ConversationSummaryProps) {
    return (
        <Card className="bg-[#1b2539] border-0">
            <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">Conversation Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#232b3c] p-3 rounded-md">
                        <p className="text-sm text-gray-400">Total Messages</p>
                        <p className="text-xl font-semibold">{messages.length}</p>
                    </div>
                    <div className="bg-[#232b3c] p-3 rounded-md">
                        <p className="text-sm text-gray-400">User Messages</p>
                        <p className="text-xl font-semibold">
                            {messages.filter(m => m.message_role === 'user').length}
                        </p>
                    </div>
                    <div className="bg-[#232b3c] p-3 rounded-md">
                        <p className="text-sm text-gray-400">Bot Messages</p>
                        <p className="text-xl font-semibold">
                            {messages.filter(m => m.message_role === 'assistant').length}
                        </p>
                    </div>
                </div>

                {chatbotInfo && <ChatbotDetails chatbotInfo={chatbotInfo} />}
            </CardContent>
        </Card>
    );
}

interface ChatbotDetailsProps {
    chatbotInfo: ChatbotInfo;
}

function ChatbotDetails({ chatbotInfo }: ChatbotDetailsProps) {
    return (
        <div className="mt-4 p-4 bg-[#232b3c] rounded-md">
            <h4 className="font-medium mb-2">Chatbot Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                    <span className="text-gray-400">Name: </span>
                    <span>{chatbotInfo.name}</span>
                </div>
                <div>
                    <span className="text-gray-400">API Key: </span>
                    <span className="font-mono text-xs">{chatbotInfo.api_key}</span>
                </div>
                <div>
                    <span className="text-gray-400">Platform: </span>
                    <span>{chatbotInfo.platform}</span>
                </div>
                <div>
                    <span className="text-gray-400">Industry: </span>
                    <span>{chatbotInfo.industry}</span>
                </div>
                <div className="md:col-span-2">
                    <span className="text-gray-400">Created: </span>
                    <span>{new Date(chatbotInfo.created_at).toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}