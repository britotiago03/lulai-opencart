import Link from "next/link";
import { Bot, Eye, MessageCircle } from "lucide-react";
import { ChatbotWithStats } from "@/types/chatbot";
import StatusBadge from "./StatusBadge";

interface ChatbotTableProps {
    chatbots: ChatbotWithStats[];
}

export default function ChatbotTable({ chatbots }: ChatbotTableProps) {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Never";
        
        try {
            return new Date(dateString).toLocaleString(undefined, {
                dateStyle: "short",
                timeStyle: "short",
            });
        } catch (e) {
            return "Invalid Date";
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                <tr className="border-b border-gray-700">
                    <th className="py-3 px-4 text-left">Chatbot</th>
                    <th className="py-3 px-4 text-left">Owner</th>
                    <th className="py-3 px-4 text-left">Industry</th>
                    <th className="py-3 px-4 text-left">Platform</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Conversations</th>
                    <th className="py-3 px-4 text-left">Last Active</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                </tr>
                </thead>
                <tbody>
                {chatbots.map((chatbot) => (
                    <tr key={chatbot.id} className="border-b border-gray-800 hover:bg-[#232b3c] transition-colors">
                        <td className="py-3 px-4">
                            <div className="flex items-center">
                                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                                    <Bot className="h-4 w-4" />
                                </div>
                                {chatbot.name}
                            </div>
                        </td>
                        <td className="py-3 px-4">
                            <div>
                                <div className="font-medium">{chatbot.userName}</div>
                                <div className="text-sm text-gray-400">{chatbot.userEmail}</div>
                            </div>
                        </td>
                        <td className="py-3 px-4">
                            <span className="px-2 py-1 text-xs bg-blue-900/30 text-blue-400 rounded-full">
                                {chatbot.industry}
                            </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{chatbot.platform}</td>
                        <td className="py-3 px-4">
                            <StatusBadge status={chatbot.status} />
                        </td>
                        <td className="py-3 px-4">
                            {chatbot.conversationCount > 0 && chatbot.api_key ? (
                                <Link 
                                    href={`/admin/conversations?filter=${encodeURIComponent(chatbot.api_key)}`}
                                    className="flex items-center text-blue-500 hover:text-blue-400 cursor-pointer"
                                >
                                    <span className="mr-1">{chatbot.conversationCount}</span>
                                    <MessageCircle className="h-4 w-4" />
                                </Link>
                            ) : (
                                <span>0</span>
                            )}
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                            {formatDate(chatbot.lastActive)}
                        </td>
                        <td className="py-3 px-4">
                            <div className="flex space-x-2">
                                <Link
                                    href={`/admin/chatbots/${chatbot.id}`}
                                    className="p-1 text-blue-500 hover:text-blue-400 transition-colors"
                                    title="View details"
                                >
                                    <Eye className="h-4 w-4" />
                                </Link>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}