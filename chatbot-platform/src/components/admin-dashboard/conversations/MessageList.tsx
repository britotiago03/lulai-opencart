// src/components/admin-dashboard/conversations/MessageList.tsx
import { Message as MessageType } from "@/types/conversation";
import Message from "./Message";

interface MessageListProps {
    messages: MessageType[];
}

export default function MessageList({ messages }: MessageListProps) {
    return (
        <div className="space-y-6 mb-6">
            {messages.map((message, index) => (
                <Message key={message.id || index} message={message} />
            ))}
        </div>
    );
}