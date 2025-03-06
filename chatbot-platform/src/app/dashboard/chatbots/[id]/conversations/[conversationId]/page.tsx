// src/app/dashboard/chatbots/[id]/conversations/[conversationId]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ConversationDetail } from '@/lib/analytics/types';
import { CheckCircle, User, Bot, Star } from 'lucide-react';

export default function ConversationDetailPage({ params }: { params: { id: string; conversationId: string } }) {
    const chatbotId = params.id;
    const conversationId = params.conversationId;
    const [conversation, setConversation] = useState<ConversationDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [feedbackRating, setFeedbackRating] = useState<number>(0);
    const [feedbackText, setFeedbackText] = useState<string>('');

    useEffect(() => {
        const fetchConversation = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/conversations/${conversationId}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Conversation not found');
                    }
                    throw new Error('Failed to fetch conversation details');
                }

                const data = await response.json();
                setConversation(data.conversation);
            } catch (error) {
                console.error('Error fetching conversation:', error);
                setError(error instanceof Error ? error.message : 'Failed to load conversation');
            } finally {
                setLoading(false);
            }
        };

        fetchConversation();
    }, [conversationId]);

    const handleFeedbackSubmit = async (messageId: string) => {
        if (feedbackRating === 0) return;

        try {
            setSubmittingFeedback(true);

            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messageId,
                    rating: feedbackRating,
                    feedbackText: feedbackText.trim() || null
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit feedback');
            }

            setFeedbackMessage('Feedback submitted successfully');
            setFeedbackRating(0);
            setFeedbackText('');

            // Refresh conversation data
            const updatedResponse = await fetch(`/api/conversations/${conversationId}`);
            const updatedData = await updatedResponse.json();
            setConversation(updatedData.conversation);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setFeedbackMessage('Failed to submit feedback');
        } finally {
            setSubmittingFeedback(false);
        }
    };

    // Format date for display
    const formatDateTime = (date: Date | string) => {
        try {
            return new Date(date).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (error) {
            console.error("Error formatting date:", error);
            return "Invalid date";
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center py-8">Loading conversation...</div>
            </div>
        );
    }

    if (error || !conversation) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-500 mb-4">{error || 'Failed to load conversation'}</p>
                        <Link
                            href={`/dashboard/chatbots/${chatbotId}/conversations`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Back to Conversations
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Check if a message has feedback
    const getMessageFeedback = (messageId: string) => {
        return conversation.feedback.find(f => f.messageId === messageId);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Conversation Details</h1>
                <div className="flex gap-2">
                    <Link
                        href={`/dashboard/chatbots/${chatbotId}/conversations`}
                        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    >
                        Back to Conversations
                    </Link>
                </div>
            </div>

            {/* Conversation metadata */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Conversation Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Started</p>
                            <p>{formatDateTime(conversation.startedAt)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Ended</p>
                            <p>{conversation.endedAt ? formatDateTime(conversation.endedAt) : 'Ongoing'}</p>
                        </div>
                        {conversation.sourceUrl && (
                            <div>
                                <p className="text-sm text-gray-500">Source</p>
                                <p className="truncate">{conversation.sourceUrl}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-500">Messages</p>
                            <p>{conversation.messageCount}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Conversion</p>
                            <p>
                                {conversation.ledToConversion ? (
                                    <span className="text-green-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Converted {conversation.conversionValue ? `($${conversation.conversionValue})` : ''}
                  </span>
                                ) : (
                                    'No conversion'
                                )}
                            </p>
                        </div>
                        {conversation.platform && (
                            <div>
                                <p className="text-sm text-gray-500">Platform</p>
                                <p>{conversation.platform}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Conversation messages */}
            <Card>
                <CardHeader>
                    <CardTitle>Messages</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {conversation.messages.map((message) => {
                            const feedback = getMessageFeedback(message.id);

                            return (
                                <div key={message.id} className={`flex ${message.isFromUser ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] ${message.isFromUser ? 'order-2' : 'order-1'}`}>
                                        <div className={`flex items-center mb-1 ${message.isFromUser ? 'justify-end' : 'justify-start'}`}>
                                            {message.isFromUser ? (
                                                <span className="flex items-center text-sm text-gray-500">
                          User <User className="w-4 h-4 ml-1 mr-2" />
                        </span>
                                            ) : (
                                                <span className="flex items-center text-sm text-gray-500">
                          <Bot className="w-4 h-4 mr-1" /> Bot
                        </span>
                                            )}
                                            <span className="text-xs text-gray-400 ml-2">
                        {formatDateTime(message.sentAt)}
                      </span>
                                        </div>

                                        <div
                                            className={`p-3 rounded-lg ${
                                                message.isFromUser
                                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                                    : 'bg-gray-200 text-gray-800 rounded-tl-none'
                                            }`}
                                        >
                                            <p>{message.messageText}</p>
                                        </div>

                                        {/* Show AI indicators for bot messages */}
                                        {!message.isFromUser && (
                                            <div className="mt-1 flex">
                                                {message.isAiGenerated && (
                                                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full mr-2">
                            AI Generated
                          </span>
                                                )}

                                                {message.matchedTriggers && message.matchedTriggers.length > 0 && (
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            Matched: {message.matchedTriggers.join(', ')}
                          </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Show feedback if it exists */}
                                        {feedback && (
                                            <div className="mt-2 p-2 bg-yellow-50 rounded-md">
                                                <div className="flex items-center">
                                                    <span className="text-xs text-gray-500 mr-2">Feedback:</span>
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={14}
                                                            className={`${
                                                                i < feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                {feedback.feedbackText && (
                                                    <p className="text-xs mt-1 italic">`{feedback.feedbackText}`</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Add feedback option for bot messages */}
                                        {!message.isFromUser && !feedback && (
                                            <div className="mt-2">
                                                <button
                                                    onClick={() => setFeedbackMessage(message.id)}
                                                    className="text-xs text-blue-600 hover:text-blue-800"
                                                >
                                                    Rate this response
                                                </button>

                                                {feedbackMessage === message.id && (
                                                    <div className="mt-2 p-3 border rounded-md bg-gray-50">
                                                        <h4 className="text-sm font-medium mb-2">Rate this response</h4>
                                                        <div className="flex mb-2">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => setFeedbackRating(i + 1)}
                                                                    className="mr-1"
                                                                >
                                                                    <Star
                                                                        size={20}
                                                                        className={`${
                                                                            i < feedbackRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                                                        }`}
                                                                    />
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <textarea
                                                            value={feedbackText}
                                                            onChange={(e) => setFeedbackText(e.target.value)}
                                                            placeholder="Optional comments..."
                                                            className="w-full p-2 text-sm border rounded-md mb-2"
                                                            rows={2}
                                                        />
                                                        <div className="flex justify-end space-x-2">
                                                            <button
                                                                onClick={() => setFeedbackMessage(null)}
                                                                className="px-3 py-1 text-xs border rounded-md"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleFeedbackSubmit(message.id)}
                                                                disabled={feedbackRating === 0 || submittingFeedback}
                                                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md disabled:opacity-50"
                                                            >
                                                                {submittingFeedback ? 'Submitting...' : 'Submit'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}