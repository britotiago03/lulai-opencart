/* chatbot-platform/src/app/dashboard/chatbots/page.tsx */
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 dark:text-gray-300">
                            Create your first chatbot by clicking the button above.
                        </p>
                    </CardContent>
                </Card>
            </div>
            <ChatbotList />
        </div>
    );
}