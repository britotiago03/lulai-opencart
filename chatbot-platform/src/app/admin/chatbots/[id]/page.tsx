// src/app/admin/chatbots/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
    ArrowLeft,
    User,
    MessageSquare,
    FileText,
    Code,
    BarChart3,
    GitCommit,
    CheckCircle,
    Settings,
    ExternalLink,
    Trash2,
    RefreshCw,
    Zap,
    Copy
} from 'lucide-react';
import Link from 'next/link';

interface Chatbot {
    id: string;
    name: string;
    description: string;
    industry: string;
    userId: string;
    userName: string;
    userEmail: string;
    createdAt: string;
    updatedAt: string;
    status: 'active' | 'inactive' | 'suspended';
    responseCount: number;
    conversationCount: number;
    conversionRate: number;
    averageResponseTime: number;
    aiEnhanced: boolean;
    embedCode: string;
    apiKey: string;
    responses: {
        id: string;
        triggerPhrase: string;
        responseText: string;
        isAiEnhanced: boolean;
        matchCount: number;
    }[];
}

export default function AdminChatbotDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [chatbot, setChatbot] = useState<Chatbot | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showApiKey, setShowApiKey] = useState<boolean>(false);

    useEffect(() => {
        const fetchChatbot = async () => {
            try {
                setLoading(true);
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Mock chatbot data - In a real application, you'd fetch from an API
                const mockChatbot: Chatbot = {
                    id: params.id,
                    name: 'Customer Support Bot',
                    description: 'Handles customer inquiries about products, orders, and returns',
                    industry: 'retail',
                    userId: '1',
                    userName: 'John Doe',
                    userEmail: 'john@example.com',
                    createdAt: '2023-05-15T10:30:00Z',
                    updatedAt: '2023-08-03T14:22:00Z',
                    status: 'active',
                    responseCount: 25,
                    conversationCount: 342,
                    conversionRate: 8.2,
                    averageResponseTime: 1.3,
                    aiEnhanced: true,
                    embedCode: '<script src="https://luiai.com/embed.js?id=abc123"></script>',
                    apiKey: 'sk_live_abcdefghijklmnopqrstuvwxyz123456',
                    responses: [
                        {
                            id: '1',
                            triggerPhrase: 'return policy',
                            responseText: 'We offer a 30-day return policy for all unused items in their original packaging.',
                            isAiEnhanced: false,
                            matchCount: 87
                        },
                        {
                            id: '2',
                            triggerPhrase: 'shipping time',
                            responseText: 'Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days.',
                            isAiEnhanced: false,
                            matchCount: 124
                        },
                        {
                            id: '3',
                            triggerPhrase: 'product recommendation',
                            responseText: 'Based on your shopping preferences, I recommend checking out our new collection of eco-friendly products.',
                            isAiEnhanced: true,
                            matchCount: 56
                        },
                        {
                            id: '4',
                            triggerPhrase: 'order status',
                            responseText: 'I can help you check the status of your order. Could you please provide your order number?',
                            isAiEnhanced: true,
                            matchCount: 198
                        },
                        {
                            id: '5',
                            triggerPhrase: 'discount code',
                            responseText: 'You can use code WELCOME10 for 10% off your first order. For existing customers, we send special offers via email.',
                            isAiEnhanced: false,
                            matchCount: 75
                        }
                    ]
                };

                setChatbot(mockChatbot);
            } catch (error) {
                console.error('Error fetching chatbot:', error);
                setError('Failed to load chatbot details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchChatbot();
    }, [params.id]);

    // Format date for display
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const copyToClipboard = (text: string, message: string) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                alert(message);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                    <p className="mt-4">Loading chatbot data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6">
                        <p className="text-red-400 mb-4">{error}</p>
                        <Link
                            href="/admin/chatbots"
                            className="flex items-center text-blue-500 hover:text-blue-400"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Chatbots
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!chatbot) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6">
                        <p className="mb-4">Chatbot not found.</p>
                        <Link
                            href="/admin/chatbots"
                            className="flex items-center text-blue-500 hover:text-blue-400"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Chatbots
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6 flex justify-between items-center">
                <div className="flex items-center">
                    <Link
                        href="/admin/chatbots"
                        className="mr-4 p-2 rounded-full hover:bg-[#232b3c] transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-2xl font-bold">{chatbot.name}</h1>
                    <span className={`ml-4 px-2 py-1 text-xs rounded-full ${
                        chatbot.status === 'active'
                            ? 'bg-green-900/30 text-green-400'
                            : chatbot.status === 'suspended'
                                ? 'bg-red-900/30 text-red-400'
                                : 'bg-gray-700 text-gray-300'
                    }`}>
            {chatbot.status.charAt(0).toUpperCase() + chatbot.status.slice(1)}
          </span>
                </div>
                <div className="flex gap-2">
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        onClick={() => router.push(`/admin/chatbots/${params.id}/edit`)}
                    >
                        Edit Chatbot
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Chatbot Info Card */}
                <Card className="bg-[#1b2539] border-0 col-span-1">
                    <CardContent className="p-6">
                        <div className="mb-6">
                            <div className="bg-blue-600/20 p-3 inline-flex rounded-lg mb-4">
                                <MessageSquare className="h-6 w-6 text-blue-500" />
                            </div>
                            <p className="text-gray-400 mb-4">{chatbot.description}</p>
                            <div className="flex items-center text-sm text-gray-400">
                <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full text-xs">
                  {chatbot.industry}
                </span>
                                {chatbot.aiEnhanced && (
                                    <span className="ml-2 px-2 py-1 bg-purple-900/30 text-purple-400 rounded-full text-xs flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    AI Enhanced
                  </span>
                                )}
                            </div>
                        </div>

                        <hr className="my-6 border-gray-700" />

                        <div className="space-y-4">
                            <div className="flex items-start">
                                <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-400">Owner</p>
                                    <Link href={`/admin/users/${chatbot.userId}`} className="font-medium text-blue-500 hover:text-blue-400">
                                        {chatbot.userName}
                                    </Link>
                                    <p className="text-sm text-gray-400">{chatbot.userEmail}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <GitCommit className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-400">Created</p>
                                    <p className="font-medium">{formatDate(chatbot.createdAt)}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <RefreshCw className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-400">Last Updated</p>
                                    <p className="font-medium">{formatDate(chatbot.updatedAt)}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <FileText className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-400">Responses</p>
                                    <p className="font-medium">{chatbot.responseCount}</p>
                                </div>
                            </div>
                        </div>

                        <hr className="my-6 border-gray-700" />

                        <div>
                            <h3 className="font-semibold mb-4">Integration</h3>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Embed Code</p>
                                    <div className="bg-[#232b3c] p-3 rounded-md text-sm font-mono text-gray-300 relative">
                                        <div className="overflow-x-auto whitespace-nowrap">
                                            {chatbot.embedCode}
                                        </div>
                                        <button
                                            className="absolute top-2 right-2 p-1 rounded-md hover:bg-gray-700 transition-colors"
                                            onClick={() => copyToClipboard(chatbot.embedCode, 'Embed code copied to clipboard!')}
                                            title="Copy embed code"
                                        >
                                            <Copy className="h-4 w-4 text-gray-400" />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-400 mb-1">API Key</p>
                                    <div className="bg-[#232b3c] p-3 rounded-md text-sm font-mono text-gray-300 relative">
                                        <div className="overflow-x-auto whitespace-nowrap">
                                            {showApiKey ? chatbot.apiKey : '••••••••••••••••••••••••••••••'}
                                        </div>
                                        <div className="absolute top-2 right-2 flex">
                                            <button
                                                className="p-1 rounded-md hover:bg-gray-700 transition-colors mr-1"
                                                onClick={() => setShowApiKey(!showApiKey)}
                                                title={showApiKey ? "Hide API key" : "Show API key"}
                                            >
                                                {showApiKey ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 014.02 8.971m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                            <button
                                                className="p-1 rounded-md hover:bg-gray-700 transition-colors"
                                                onClick={() => {
                                                    if (showApiKey) {
                                                        copyToClipboard(chatbot.apiKey, 'API key copied to clipboard!');
                                                    } else {
                                                        setShowApiKey(true);
                                                        setTimeout(() => {
                                                            copyToClipboard(chatbot.apiKey, 'API key copied to clipboard!');
                                                        }, 100);
                                                    }
                                                }}
                                                title="Copy API key"
                                            >
                                                <Copy className="h-4 w-4 text-gray-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    className="w-full px-4 py-2 mt-2 border border-yellow-600 text-yellow-500 rounded-md hover:bg-yellow-900/20 transition-colors flex items-center justify-center"
                                    onClick={() => {
                                        if (confirm('Are you sure you want to regenerate the API key? All existing integrations will need to be updated.')) {
                                            alert('API key regenerated');
                                        }
                                    }}
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Regenerate API Key
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Details Sections */}
                <div className="col-span-1 xl:col-span-2 space-y-6">
                    {/* Performance Stats */}
                    <Card className="bg-[#1b2539] border-0">
                        <CardHeader>
                            <CardTitle>Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="p-4 bg-[#232b3c] rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm text-gray-400">Conversations</p>
                                        <MessageSquare className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <p className="text-2xl font-bold">{chatbot.conversationCount}</p>
                                    <p className="text-xs text-green-400">↑ 12% from last month</p>
                                </div>

                                <div className="p-4 bg-[#232b3c] rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm text-gray-400">Response Time</p>
                                        <Clock className="h-5 w-5 text-yellow-500" />
                                    </div>
                                    <p className="text-2xl font-bold">{chatbot.averageResponseTime}s</p>
                                    <p className="text-xs text-green-400">↓ 0.2s from last month</p>
                                </div>

                                <div className="p-4 bg-[#232b3c] rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm text-gray-400">Conversion Rate</p>
                                        <ChartBar className="h-5 w-5 text-green-500" />
                                    </div>
                                    <p className="text-2xl font-bold">{chatbot.conversionRate}%</p>
                                    <p className="text-xs text-green-400">↑ 1.5% from last month</p>
                                </div>

                                <div className="p-4 bg-[#232b3c] rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm text-gray-400">Satisfaction</p>
                                        <ThumbsUp className="h-5 w-5 text-purple-500" />
                                    </div>
                                    <p className="text-2xl font-bold">4.8/5</p>
                                    <p className="text-xs text-green-400">↑ 0.2 from last month</p>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-center">
                                <Link
                                    href={`/admin/analytics?chatbotId=${chatbot.id}`}
                                    className="text-blue-500 hover:text-blue-400 flex items-center"
                                >
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    View Full Analytics
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Responses */}
                    <Card className="bg-[#1b2539] border-0">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Responses</CardTitle>
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    placeholder="Search responses..."
                                    className="p-2 bg-[#232b3c] border border-gray-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 mr-2"
                                />
                                <button
                                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                    onClick={() => alert('Add response')}
                                >
                                    Add Response
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b border-gray-700">
                                    <tr>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Trigger Phrase</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Response</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Type</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Matches</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                    {chatbot.responses.map((response) => (
                                        <tr key={response.id} className="hover:bg-[#232b3c] transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="font-medium truncate max-w-[200px]">
                                                    {response.triggerPhrase}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="truncate max-w-[300px]">
                                                    {response.responseText}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {response.isAiEnhanced ? (
                                                    <span className="inline-flex items-center px-2 py-1 bg-purple-900/30 text-purple-400 rounded-full text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              AI Enhanced
                            </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              Standard
                            </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {response.matchCount}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    className="p-1 rounded-md hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
                                                    onClick={() => alert(`Edit response ${response.id}`)}
                                                >
                                                    <Settings className="h-4 w-4" />
                                                </button>
                                                <button
                                                    className="p-1 rounded-md hover:bg-gray-700 transition-colors text-gray-400 hover:text-white ml-1"
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this response?')) {
                                                            alert(`Delete response ${response.id}`);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 flex justify-center">
                                <button
                                    className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors text-sm"
                                    onClick={() => alert('View all responses')}
                                >
                                    View All Responses
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Conversations */}
                    <Card className="bg-[#1b2539] border-0">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Recent Conversations</CardTitle>
                            <Link
                                href={`/admin/chatbots/${chatbot.id}/conversations`}
                                className="text-sm text-blue-500 hover:text-blue-400"
                            >
                                View All →
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Mock conversation data */}
                                <div className="border border-gray-700 rounded-lg p-4">
                                    <div className="flex justify-between mb-2">
                                        <div className="text-sm text-gray-400">Today, 10:23 AM</div>
                                        <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded-full text-xs">
                      Converted
                    </span>
                                    </div>
                                    <p className="font-medium">Where can I find your sizing guide?</p>
                                    <p className="text-sm text-gray-400 mt-1">Visitor from New York, USA</p>
                                </div>

                                <div className="border border-gray-700 rounded-lg p-4">
                                    <div className="flex justify-between mb-2">
                                        <div className="text-sm text-gray-400">Today, 09:17 AM</div>
                                        <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
                      No Conversion
                    </span>
                                    </div>
                                    <p className="font-medium">Do you ship to Canada?</p>
                                    <p className="text-sm text-gray-400 mt-1">Visitor from Toronto, Canada</p>
                                </div>

                                <div className="border border-gray-700 rounded-lg p-4">
                                    <div className="flex justify-between mb-2">
                                        <div className="text-sm text-gray-400">Yesterday, 15:42 PM</div>
                                        <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded-full text-xs">
                      Converted
                    </span>
                                    </div>
                                    <p className="font-medium">I need to track my order</p>
                                    <p className="text-sm text-gray-400 mt-1">Visitor from Seattle, USA</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Admin Actions */}
                    <Card className="bg-[#1b2539] border-0">
                        <CardHeader>
                            <CardTitle>Admin Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    className="flex flex-col items-center justify-center p-4 border border-gray-700 rounded-lg hover:bg-[#232b3c] transition-colors"
                                    onClick={() => {
                                        const newStatus = chatbot.status === 'active' ? 'inactive' : 'active';
                                        alert(`Set chatbot status to ${newStatus}`);
                                    }}
                                >
                                    <PowerIcon className="h-6 w-6 text-yellow-500 mb-2" />
                                    <span className="text-sm">{chatbot.status === 'active' ? 'Disable' : 'Enable'} Chatbot</span>
                                </button>

                                <button
                                    className="flex flex-col items-center justify-center p-4 border border-gray-700 rounded-lg hover:bg-[#232b3c] transition-colors"
                                    onClick={() => alert('Reset analytics')}
                                >
                                    <RefreshCw className="h-6 w-6 text-blue-500 mb-2" />
                                    <span className="text-sm">Reset Analytics</span>
                                </button>

                                <button
                                    className="flex flex-col items-center justify-center p-4 border border-gray-700 rounded-lg hover:bg-[#232b3c] transition-colors"
                                    onClick={() => {
                                        router.push(`/admin/users/${chatbot.userId}`);
                                    }}
                                >
                                    <User className="h-6 w-6 text-green-500 mb-2" />
                                    <span className="text-sm">View Owner</span>
                                </button>

                                <button
                                    className="flex flex-col items-center justify-center p-4 border border-gray-700 rounded-lg hover:bg-[#232b3c] transition-colors"
                                    onClick={() => window.open(`/dashboard/chatbots/${chatbot.id}/test`, '_blank')}
                                >
                                    <ExternalLink className="h-6 w-6 text-purple-500 mb-2" />
                                    <span className="text-sm">Open Test Window</span>
                                </button>

                                <button
                                    className="flex flex-col items-center justify-center p-4 border border-gray-700 rounded-lg hover:bg-[#232b3c] transition-colors"
                                    onClick={() => alert('Export chatbot data')}
                                >
                                    <Download className="h-6 w-6 text-gray-400 mb-2" />
                                    <span className="text-sm">Export Data</span>
                                </button>

                                <button
                                    className="flex flex-col items-center justify-center p-4 border border-red-900/30 text-red-400 rounded-lg hover:bg-red-900/20 transition-colors"
                                    onClick={() => {
                                        if (confirm('Are you sure you want to delete this chatbot? This action cannot be undone.')) {
                                            alert('Chatbot deleted');
                                            router.push('/admin/chatbots');
                                        }
                                    }}
                                >
                                    <Trash2 className="h-6 w-6 mb-2" />
                                    <span className="text-sm">Delete Chatbot</span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Clock icon component
function Clock({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
    );
}

// ChartBar icon component
function ChartBar({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
            <line x1="3" y1="20" x2="21" y2="20"></line>
        </svg>
    );
}

// ThumbsUp icon component
function ThumbsUp({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
        </svg>
    );
}

// Download icon component
function Download({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
    );
}

// PowerIcon component
function PowerIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
            <line x1="12" y1="2" x2="12" y2="12"></line>
        </svg>
    );
}