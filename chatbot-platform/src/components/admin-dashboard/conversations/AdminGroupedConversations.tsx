import { Calendar } from "lucide-react";
import AdminConversationCard from "./AdminConversationCard";
import { Conversation } from "@/types/conversation";

export default function AdminGroupedConversations({ conversations }: { conversations: Conversation[] }) {
    // Group conversations by date
    const grouped = conversations.reduce((groups, convo) => {
        const date = new Date(convo.created_at).toLocaleDateString();
        groups[date] = groups[date] || [];
        groups[date].push(convo);
        return groups;
    }, {} as Record<string, Conversation[]>);

    // Sort dates in descending order (newest first)
    const sortedDates = Object.keys(grouped).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    return (
        <div className="space-y-8">
            {sortedDates.map((date) => (
                <div key={date}>
                    <div className="flex items-center mb-4">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <h2 className="text-lg font-medium text-gray-300">{date}</h2>
                    </div>
                    <div className="space-y-4">
                        {grouped[date].map((convo) => (
                            <AdminConversationCard key={convo.threadId || convo.id} convo={convo} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}