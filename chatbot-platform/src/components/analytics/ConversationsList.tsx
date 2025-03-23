// src/components/analytics/ConversationsList.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ConversationSummary } from '@/lib/analytics/types';
import { MessageCircle, CheckCircle, Calendar, Clock } from 'lucide-react';

interface ConversationsListProps {
    conversations: ConversationSummary[];
    totalCount: number;
    chatbotId: string;
}

export default function ConversationsList({
                                              conversations,
                                              totalCount,
                                              chatbotId
                                          }: ConversationsListProps) {
    const [limit, setLimit] = useState(5);

    if (conversations.length === 0) {
        return (
            <div className="text-center py-6">
                <p className="text-gray-500">No conversations found for this period.</p>
            </div>
        );
    }

    // Format date for display
    const formatDate = (date: Date | string) => {
        try {
            const dateObj = date instanceof Date ? date : new Date(date);
            return dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch (e) {
            console.error("Error formatting date:", e);
            return "Invalid date";
        }
    };

// Format time for display
    const formatTime = (date: Date | string) => {
        try {
            const dateObj = date instanceof Date ? date : new Date(date);
            return dateObj.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (e) {
            console.error("Error formatting time:", e);
            return "Invalid time";
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-4">
                {conversations.slice(0, limit).map((conversation) => (
                    <Link
                        key={conversation.id}
                        href={`/dashboard/chatbots/${chatbotId}/conversations/${conversation.id}`}
                        className="block p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex justify-between mb-2">
                            <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(conversation.startedAt)}
                                <Clock className="w-4 h-4 ml-3 mr-1" />
                                {formatTime(conversation.startedAt)}
                            </div>
                            {conversation.ledToConversion && (
                                <span className="flex items-center text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Converted {conversation.conversionValue && `($${conversation.conversionValue})`}
                </span>
                            )}
                        </div>

                        <div className="mb-2">
                            <p className="font-medium truncate">{conversation.firstMessage}</p>
                            <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                        </div>

                        <div className="flex items-center mt-3 text-sm text-gray-500">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {conversation.messageCount} {conversation.messageCount === 1 ? 'message' : 'messages'}

                            {conversation.sourceUrl && (
                                <span className="ml-4 truncate max-w-xs">
                                 Source: {
                                    conversation.sourceUrl.startsWith('http')
                                        ? new URL(conversation.sourceUrl).pathname
                                        : conversation.sourceUrl
                                }
                                </span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>

            {conversations.length < totalCount && limit < totalCount && (
                <div className="text-center pt-2">
                    <button
                        onClick={() => setLimit(prev => Math.min(prev + 5, totalCount))}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        Show more ({Math.min(limit, conversations.length)} of {totalCount})
                    </button>
                </div>
            )}

            {limit > 5 && (
                <div className="text-center pt-2">
                    <button
                        onClick={() => setLimit(5)}
                        className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                    >
                        Show less
                    </button>
                </div>
            )}

            <div className="text-center pt-2">
                <Link
                    href={`/dashboard/chatbots/${chatbotId}/conversations`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    View all conversations
                </Link>
            </div>
        </div>
    );
}