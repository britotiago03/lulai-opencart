// src/components/admin-dashboard/conversations/Message.tsx
import { useState } from "react";
import { User, Bot, Clock, Info } from "lucide-react";
import { Message as MessageType } from "@/types/conversation";

interface MessageProps {
    message: MessageType;
}

export default function Message({ message }: MessageProps) {
    const [showMetadata, setShowMetadata] = useState(false);

    const toggleMetadata = () => {
        setShowMetadata(prev => !prev);
    };

    return (
        <div>
            <div className={`flex ${message.message_role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] flex ${message.message_role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.message_role === 'user' ? 'bg-blue-600 ml-3' : 'bg-purple-600 mr-3'
                    }`}>
                        {message.message_role === 'user' ? (
                            <User className="h-5 w-5" />
                        ) : (
                            <Bot className="h-5 w-5" />
                        )}
                    </div>

                    <div className={`relative p-4 rounded-lg ${
                        message.message_role === 'user' ? 'bg-blue-900/20 text-white' : 'bg-[#232b3c] text-white'
                    }`}>
                        <div className="text-sm text-gray-400 flex items-center mb-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(message.created_at).toLocaleString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </div>
                        <div>{message.message_content}</div>

                        {message.metadata && (
                            <button
                                onClick={toggleMetadata}
                                className={`absolute -bottom-6 right-0 text-xs flex items-center ${
                                    showMetadata ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                <Info className="h-3 w-3 mr-1" />
                                {showMetadata ? 'Hide metadata' : 'Show metadata'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {message.metadata && showMetadata && (
                <div className="mx-14 mt-8 mb-4 p-3 bg-gray-800/50 rounded border border-gray-700 text-xs font-mono overflow-x-auto">
                    <pre className="text-gray-300">
                        {JSON.stringify(message.metadata, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}