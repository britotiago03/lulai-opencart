/* chatbot-platform/src/app/dashboard/chatbots/page.tsx */
import Link from "next/link";
import ChatbotList from "@/components/chatbots/ChatbotList";

export default function ChatbotsPage() {
    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">My Chatbots</h1>
                <Link
                    href="/dashboard/chatbots/create"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Create New Chatbot
                </Link>
            </div>
            <ChatbotList />
        </div>
    );
}