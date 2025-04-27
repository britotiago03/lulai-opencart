import { Clock, User, Bot } from "lucide-react";

export default function ChatBubble({
                                       role,
                                       content,
                                       timestamp,
                                   }: {
    role: string;
    content: string;
    timestamp: string;
}) {
    const isUser = role === "user";
    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] flex ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isUser ? "bg-blue-600 ml-3" : "bg-purple-600 mr-3"
                }`}>
                    {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
                <div className={`p-4 rounded-lg ${
                    isUser ? "bg-blue-900/20 text-white" : "bg-[#232b3c] text-white"
                }`}>
                    <div className="text-sm text-gray-400 flex items-center mb-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </div>
                    <div>{content}</div>
                </div>
            </div>
        </div>
    );
}
