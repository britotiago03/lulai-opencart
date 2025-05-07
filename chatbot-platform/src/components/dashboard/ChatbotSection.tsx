// src/components/dashboard/ChatbotSection.tsx
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Chatbot } from "@/types/dashboard";

interface ChatbotListProps {
    chatbots: Chatbot[];
}

function ChatbotList({ chatbots }: ChatbotListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chatbots.map((chatbot) => (
                <Link key={chatbot.id} href={`/dashboard/agents`}>
                    <div className="border border-gray-700 rounded-lg p-4 hover:bg-[#232b3c] transition-colors cursor-pointer h-full">
                        <div className="flex items-start justify-between mb-2">
                            <div className="font-medium line-clamp-1">{chatbot.name}</div>
                            <div className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded-full">
                                {chatbot.industry}
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                            {chatbot.description || "No description"}
                        </p>
                        <div className="text-xs text-gray-500">
                            Created: {new Date(chatbot.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

function EmptyChatbotState() {
    return (
        <div className="text-center">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto mb-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
            </svg>
            <h3 className="text-xl font-medium mb-2">No Chatbots Yet</h3>
            <p className="text-gray-400 mb-6">
                Create your first chatbot to start engaging with your customers
            </p>
            <Link
                href={`/dashboard/integrations`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
                Create Your First Chatbot
            </Link>
        </div>
    );
}

interface ChatbotSectionProps {
    chatbots: Chatbot[];
}

export default function ChatbotSection({ chatbots }: ChatbotSectionProps) {
    const hasChatbots = chatbots.length > 0;

    return (
        <Card className="bg-[#1b2539] border-0 mt-6">
            <CardContent className="p-4 sm:p-6">
                {hasChatbots ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Your Chatbot</h3>
                            <Link
                                href={`/dashboard/agents`}
                                className="text-sm text-blue-500 hover:text-blue-400"
                            >
                                Manage →
                            </Link>
                        </div>
                        <ChatbotList chatbots={chatbots} />
                    </>
                ) : (
                    <EmptyChatbotState />
                )}
            </CardContent>
        </Card>
    );
}