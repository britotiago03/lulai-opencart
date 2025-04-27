import { Card, CardContent } from "@/components/ui/card";
import { Message } from "@/app/dashboard/conversations/[id]/page";

export default function ConversationStats({ messages }: { messages: Message[] }) {
    const userCount = messages.filter(m => m.message_role === "user").length;
    const botCount = messages.filter(m => m.message_role === "assistant").length;

    return (
        <Card className="bg-[#1b2539] border-0">
            <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">Conversation Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Stat label="Total Messages" value={messages.length} />
                    <Stat label="User Messages" value={userCount} />
                    <Stat label="Bot Messages" value={botCount} />
                </div>
            </CardContent>
        </Card>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-[#232b3c] p-3 rounded-md">
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-xl font-semibold">{value}</p>
        </div>
    );
}
