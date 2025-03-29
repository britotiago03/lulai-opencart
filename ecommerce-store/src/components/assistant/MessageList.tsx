'use client';

import React from 'react';
import MessageItem from './MessageItem';
import { Message } from '@/types/assistant';

interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
    isSpeaking: boolean;
    speakingMessageIndex: number | null;
    playMessageAudio: (content: string, index: number) => void;
    stopSpeaking: () => void;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const MessageList: React.FC<MessageListProps> = ({
                                                     messages,
                                                     isLoading,
                                                     isSpeaking,
                                                     speakingMessageIndex,
                                                     playMessageAudio,
                                                     stopSpeaking,
                                                     messagesEndRef
                                                 }) => {
    return (
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((message, idx) => (
                <MessageItem
                    key={idx}
                    message={message}
                    index={idx}
                    isSpeaking={isSpeaking}
                    speakingMessageIndex={speakingMessageIndex}
                    playMessageAudio={playMessageAudio}
                    stopSpeaking={stopSpeaking}
                />
            ))}

            {isLoading && (
                <div className="flex justify-center my-2">
                    <div className="animate-pulse flex space-x-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    </div>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;