'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '@/types/assistant';

interface MessageItemProps {
    message: Message;
    index: number;
    isSpeaking: boolean;
    speakingMessageIndex: number | null;
    playMessageAudio: (content: string, index: number) => void;
    stopSpeaking: () => void;
}

const MessageItem: React.FC<MessageItemProps> = ({
                                                     message,
                                                     index,
                                                     isSpeaking,
                                                     speakingMessageIndex,
                                                     playMessageAudio,
                                                     stopSpeaking
                                                 }) => {
    const isCurrentlySpeaking = isSpeaking && speakingMessageIndex === index;

    return (
        <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                }`}
            >
                {message.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                ) : (
                    <div>{message.content}</div>
                )}

                {message.role === 'assistant' && (
                    <button
                        onClick={
                            isCurrentlySpeaking
                                ? stopSpeaking
                                : () => playMessageAudio(message.content, index)
                        }
                        className={`mt-1 text-xs flex items-center ${
                            message.role === 'assistant' ? 'text-gray-600' : 'text-white/80'
                        }`}
                    >
                        {isCurrentlySpeaking ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 mr-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                                </svg>
                                Stop
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 mr-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                                </svg>
                                Listen
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default MessageItem;