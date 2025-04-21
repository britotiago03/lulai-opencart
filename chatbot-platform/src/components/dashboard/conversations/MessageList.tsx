import ChatBubble from "./ChatBubble";
import { Message } from "@/app/dashboard/conversations/[id]/page";

export default function MessageList({ messages }: { messages: Message[] }) {
    return (
        <div className="space-y-4 mb-6">
            {messages.map((msg, idx) => (
                <ChatBubble
                    key={idx}
                    role={msg.message_role}
                    content={msg.message_content}
                    timestamp={msg.created_at}
                />
            ))}
        </div>
    );
}
