import { Calendar } from "lucide-react";
import ConversationCard from "./ConversationCard";
import { Conversation } from "@/hooks/useConversations";

export default function GroupedConversations({ conversations }: { conversations: Conversation[] }) {
    const grouped = conversations.reduce((groups, convo) => {
        const date = new Date(convo.created_at).toLocaleDateString();
        groups[date] = groups[date] || [];
        groups[date].push(convo);
        return groups;
    }, {} as Record<string, Conversation[]>);

    return (
        <div className="space-y-8">
            {Object.entries(grouped).map(([date, convos]) => (
                <div key={date}>
                    <div className="flex items-center mb-4">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <h2 className="text-lg font-medium text-gray-300">{date}</h2>
                    </div>
                    <div className="space-y-4">
                        {convos.map((convo) => (
                            <ConversationCard key={convo.threadId || convo.id} convo={convo} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
