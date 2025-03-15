// src/components/chatbots/ChatbotTester.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {  ThumbsUp} from 'lucide-react';
import FeedbackModal from './FeedbackModal';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    isAI?: boolean;
    isGeneralAI?: boolean;
    isTyping?: boolean;
    messageId?: string; // Database ID for the message
    conversationId?: string; // Database ID for the conversation
}

export default function ChatbotTester({ id }: { id: string }) {
    const [messages, setMessages] = useState<Message[]>([
        { id: '0', text: 'Hi there! How can I help you today?', isUser: false }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [chatbotName, setChatbotName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [visitorId, setVisitorId] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Feedback state
    const [feedbackMessageId, setFeedbackMessageId] = useState<string | null>(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    // Generate session and visitor IDs
    useEffect(() => {
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const newVisitorId = localStorage.getItem('chatbot_visitor_id') ||
            `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        setSessionId(newSessionId);
        setVisitorId(newVisitorId);

        // Save visitor ID to localStorage for future visits
        if (!localStorage.getItem('chatbot_visitor_id')) {
            localStorage.setItem('chatbot_visitor_id', newVisitorId);
        }
    }, []);

    // Fetch chatbot details
    useEffect(() => {
        const fetchChatbotDetails = async () => {
            try {
                const response = await fetch(`/api/chatbots/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setChatbotName(data.name);
                }
            } catch (error) {
                console.error('Error fetching chatbot details:', error);
            }
        };

        fetchChatbotDetails();
    }, [id]);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Function to simulate typing effect
    const simulateTyping = (messageId: string, fullText: string) => {
        let i = 0;
        const typingSpeed = 30; // milliseconds per character

        const typingInterval = setInterval(() => {
            i++;

            // Update the message with more text
            setMessages(prev => prev.map(msg =>
                msg.id === messageId
                    ? { ...msg, text: fullText.substring(0, i) }
                    : msg
            ));

            // Check if we've completed the message
            if (i >= fullText.length) {
                clearInterval(typingInterval);

                // Mark message as no longer typing
                setMessages(prev => prev.map(msg =>
                    msg.id === messageId
                        ? { ...msg, isTyping: false }
                        : msg
                ));
            }
        }, typingSpeed);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!inputValue.trim()) return;

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            isUser: true
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch(`/api/chatbots/${id}/interact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: userMessage.text,
                    sessionId,
                    visitorId,
                    sourceUrl: window.location.href,
                    platform: 'web'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            // Store conversation ID if it's returned
            const conversationId = data.conversationId;

            // Create the bot response message first with empty text
            const botResponseId = (Date.now() + 1).toString();
            const botResponse: Message = {
                id: botResponseId,
                text: '', // Start with empty text
                isUser: false,
                isAI: data.isAI,
                isGeneralAI: data.isGeneralAI,
                isTyping: true, // Mark as currently typing
                messageId: data.messageId, // Store the database message ID
                conversationId // Store the conversation ID
            };

            // Add empty message first
            setMessages(prev => [...prev, botResponse]);

            // Start the typing effect
            simulateTyping(botResponseId, data.response);

        } catch (error) {
            console.error('Error getting chatbot response:', error);

            // Add error message
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I'm having trouble responding right now. Please try again later.",
                isUser: false
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle showing feedback modal
    const handleRequestFeedback = (messageId: string) => {
        setFeedbackMessageId(messageId);
        setShowFeedbackModal(true);
    };

    // Handle submitting feedback
    const handleSubmitFeedback = async (rating: number, feedbackText: string) => {
        if (!feedbackMessageId) return;

        await fetch('/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messageId: feedbackMessageId,
                rating,
                feedbackText
            })
        });

        // Close the feedback modal
        setShowFeedbackModal(false);
        setFeedbackMessageId(null);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Test Chatbot: {chatbotName}</h1>
                <div className="flex gap-2">
                    <Link
                        href={`/dashboard/chatbots/${id}`}
                        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    >
                        Back to Details
                    </Link>
                    <Link
                        href={`/dashboard/analytics?chatbotId=${id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        View Analytics
                    </Link>
                </div>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Chat Simulator</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] overflow-y-auto mb-4 p-4 border rounded-md">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`mb-4 ${message.isUser ? 'text-right' : 'text-left'}`}
                            >
                                <div
                                    className={`inline-block max-w-[80%] px-4 py-2 rounded-lg ${
                                        message.isUser
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-gray-200 text-gray-800 rounded-tl-none'
                                    }`}
                                >
                                    <p>{message.text}</p>
                                    {/* Show typing indicator if the message is currently being typed */}
                                    {message.isTyping && (
                                        <span className="typing-indicator inline-block">
                                          <span className="dot"></span>
                                          <span className="dot"></span>
                                          <span className="dot"></span>
                                        </span>
                                    )}
                                </div>
                                {!message.isUser && !message.isTyping && (
                                    <div className="mt-1 flex items-center">
                                        {message.isAI && (
                                            <span className={`text-xs ${message.isGeneralAI ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'} px-2 py-0.5 rounded-full mr-2`}>
                                              {message.isGeneralAI ? 'AI Generated' : 'AI Enhanced'}
                                            </span>
                                        )}

                                        {/* Show feedback buttons if the message has an ID */}
                                        {message.messageId && !message.isUser && (
                                            <button
                                                onClick={() => handleRequestFeedback(message.messageId!)}
                                                className="text-xs text-gray-500 hover:text-blue-600 flex items-center"
                                            >
                                                <ThumbsUp className="w-3 h-3 mr-1" />
                                                Rate
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type your message here..."
                            className="flex-1 p-2 border rounded-md bg-background text-foreground"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                            disabled={isLoading || !inputValue.trim()}
                        >
                            {isLoading ? 'Sending...' : 'Send'}
                        </button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Testing Guide</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">
                        This simulator allows you to test how your chatbot responds to different inputs.
                        Try asking questions related to the responses you've set up for this chatbot.
                    </p>

                    <div className="space-y-2">
                        <h3 className="font-medium">Tips for testing:</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Try using exact trigger phrases you've defined</li>
                            <li>Test with variations and similar phrasing</li>
                            <li>See how the chatbot handles unrelated questions</li>
                            <li>Test with typos and grammatical errors</li>
                            <li>Rate responses to help improve the chatbot</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Feedback Modal */}
            {showFeedbackModal && feedbackMessageId && (
                <FeedbackModal
                    messageId={feedbackMessageId}
                    onClose={() => {
                        setShowFeedbackModal(false);
                        setFeedbackMessageId(null);
                    }}
                    onSubmit={handleSubmitFeedback}
                />
            )}

            {/* Add CSS for typing indicator */}
            <style jsx>{`
        .typing-indicator {
          margin-left: 5px;
        }
        .dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #808080;
          margin-right: 3px;
          animation: dot-pulse 1.5s infinite ease-in-out;
        }
        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes dot-pulse {
          0%, 100% { transform: scale(0.7); opacity: 0.5; }
          50% { transform: scale(1); opacity: 1; }
        }
      `}</style>
        </div>
    );
}