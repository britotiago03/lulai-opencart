// src/app/admin/chatbots/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
    Search,
    Filter,
    ChevronDown,
    MessageSquare,
    User,
    Calendar,
    Settings,
    Trash2,
    PlusCircle,
    Download,
    Zap
} from 'lucide-react';
import Link from 'next/link';

interface Chatbot {
    id: string;
    name: string;
    description: string;
    industry: string;
    status: 'active' | 'inactive' | 'suspended';
    userId: string;
    userName: string;
    userEmail: string;
    createdAt: string;
    updatedAt: string;
    responseCount: number;
    conversationCount: number;
    conversionRate: number;
    aiEnhanced: boolean;
}

export default function AdminChatbotsPage() {
    const [chatbots, setChatbots] = useState<Chatbot[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterIndustry, setFilterIndustry] = useState<string>('all');
    const [sortField, setSortField] = useState<string>('createdAt');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    useEffect(() => {
        const fetchChatbots = async () => {
            try {
                setLoading(true);
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Mock chatbot data - In a real application, you'd fetch from an API
                const mockChatbots: Chatbot[] = [
                    {
                        id: '1',
                        name: 'Customer Support Bot',
                        description: 'Handles customer inquiries about products, orders, and returns',
                        industry: 'retail',
                        status: 'active',
                        userId: '1',
                        userName: 'John Doe',
                        userEmail: 'john@example.com',
                        createdAt: '2023-05-15T10:30:00Z',
                        updatedAt: '2023-08-03T14:22:00Z',
                        responseCount: 25,
                        conversationCount: 342,
                        conversionRate: 8.2,
                        aiEnhanced: true
                    },
                    {
                        id: '2',
                        name: 'Fashion Advisor',
                        description: 'Provides fashion advice and product recommendations',
                        industry: 'fashion',
                        status: 'active',
                        userId: '2',
                        userName: 'Jane Smith',
                        userEmail: 'jane@example.com',
                        createdAt: '2023-06-22T09:15:00Z',
                        updatedAt: '2023-07-30T11:45:00Z',
                        responseCount: 18,
                        conversationCount: 217,
                        conversionRate: 12.5,
                        aiEnhanced: true
                    },
                    {
                        id: '3',
                        name: 'Tech Support',
                        description: 'Helps customers with technical issues and product compatibility',
                        industry: 'electronics',
                        status: 'inactive',
                        userId: '1',
                        userName: 'John Doe',
                        userEmail: 'john@example.com',
                        createdAt: '2023-04-10T15:20:00Z',
                        updatedAt: '2023-06-05T16:30:00Z',
                        responseCount: 32,
                        conversationCount: 156,
                        conversionRate: 5.8,
                        aiEnhanced: false
                    },
                    {
                        id: '4',
                        name: 'Food Delivery Assistant',
                        description: 'Handles orders, delivery inquiries, and menu questions',
                        industry: 'food',
                        status: 'active',
                        userId: '3',
                        userName: 'Bob Johnson',
                        userEmail: 'bob@example.com',
                        createdAt: '2023-07-05T12:40:00Z',
                        updatedAt: '2023-08-10T10:15:00Z',
                        responseCount: 22,
                        conversationCount: 289,
                        conversionRate: 15.3,
                        aiEnhanced: true
                    },
                    {
                        id: '5',
                        name: 'Beauty Advisor',
                        description: 'Provides beauty advice and product recommendations',
                        industry: 'beauty',
                        status: 'suspended',
                        userId: '4',
                        userName: 'Alice Williams',
                        userEmail: 'alice@example.com',
                        createdAt: '2023-03-18T14:10:00Z',
                        updatedAt: '2023-05-22T09:30:00Z',
                        responseCount: 29,
                        conversationCount: 175,
                        conversionRate: 9.7,
                        aiEnhanced: true
                    },
                    {
                        id: '6',
                        name: 'Furniture Store Assistant',
                        description: 'Helps customers find the right furniture and answers questions about materials and dimensions',
                        industry: 'retail',
                        status: 'active',
                        userId: '5',
                        userName: 'Charlie Brown',
                        userEmail: 'charlie@example.com',
                        createdAt: '2023-06-30T11:25:00Z',
                        updatedAt: '2023-08-05T13:40:00Z',
                        responseCount: 20,
                        conversationCount: 198,
                        conversionRate: 7.9,
                        aiEnhanced: false
                    }
                ];

                setChatbots(mockChatbots);
            } catch (error) {
                console.error('Error fetching chatbots:', error);
                setError('Failed to load chatbots. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchChatbots();
    }, []);

    // Filter and sort chatbots
    const filteredChatbots = chatbots.filter(chatbot => {
        // Search term filter
        const searchMatch =
            chatbot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chatbot.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chatbot.userName.toLowerCase().includes(searchTerm.toLowerCase());

        // Status filter
        const statusMatch = filterStatus === 'all' || chatbot.status === filterStatus;

        // Industry filter
        const industryMatch = filterIndustry === 'all' || chatbot.industry === filterIndustry;

        return searchMatch && statusMatch && industryMatch;
    }).sort((a, b) => {
        // Type assertion to access dynamic properties
        const aValue = a[sortField as keyof Chatbot];
        const bValue = b[sortField as keyof Chatbot];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortDirection === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return 0;
    });

    // Format date for display
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-900/30 text-green-400';
            case 'inactive':
                return 'bg-gray-700 text-gray-300';
            case 'suspended':
                return 'bg-red-900/30 text-red-400';
            default:
                return 'bg-gray-700 text-gray-300';
        }
    };

    // Handle chatbot deletion
    const handleDelete = (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete the chatbot "${name}"? This action cannot be undone.`)) {
            // In a real application, this would be an API call
            setChatbots(chatbots.filter(chatbot => chatbot.id !== id));
            alert(`Chatbot "${name}" has been deleted.`);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">All Chatbots</h1>

                <div className="flex flex-wrap gap-2">
                    <button
                        className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors flex items-center"
                        onClick={() => alert('Export chatbots data')}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        <span>Export</span>
                    </button>
                    <Link
                        href="/dashboard/integration"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        <span>Create Chatbot</span>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative col-span-1 md:col-span-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search chatbots..."
                        className="w-full pl-10 pr-4 py-2 bg-[#232b3c] border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="relative">
                    <select
                        className="w-full py-2 px-4 bg-[#232b3c] border border-gray-700 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 pointer-events-none" />
                </div>

                <div className="relative">
                    <select
                        className="w-full py-2 px-4 bg-[#232b3c] border border-gray-700 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={filterIndustry}
                        onChange={(e) => setFilterIndustry(e.target.value)}
                    >
                        <option value="all">All Industries</option>
                        <option value="retail">Retail</option>
                        <option value="fashion">Fashion</option>
                        <option value="electronics">Electronics</option>
                        <option value="food">Food</option>
                        <option value="beauty">Beauty</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 pointer-events-none" />
                </div>
            </div>

            {/* Toggle View Mode */}
            <div className="mb-4 flex justify-end">
                <div className="bg-[#232b3c] border border-gray-700 rounded-md overflow-hidden flex">
                    <button
                        className={`px-3 py-1 flex items-center ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
                        onClick={() => setViewMode('list')}
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3 6H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3 12H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3 18H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <button
                        className={`px-3 py-1 flex items-center ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
                        onClick={() => setViewMode('grid')}
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 3H3V10H10V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 3H14V10H21V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 14H14V21H21V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 14H3V21H10V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Loading state */}
            {loading && (
                <div className="flex justify-center items-center py-20">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <span className="ml-3">Loading chatbots...</span>
                </div>
            )}

            {/* Error state */}
            {error && (
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6 text-center">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </button>
                    </CardContent>
                </Card>
            )}

            {/* List View */}
            {!loading && !error && viewMode === 'list' && (
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="bg-[#232b3c] border-b border-gray-700">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                                        <div className="flex items-center">
                                            <span>Name</span>
                                            {sortField === 'name' && (
                                                <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>
                                        <div className="flex items-center">
                                            <span>Status</span>
                                            {sortField === 'status' && (
                                                <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('industry')}>
                                        <div className="flex items-center">
                                            <span>Industry</span>
                                            {sortField === 'industry' && (
                                                <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('userName')}>
                                        <div className="flex items-center">
                                            <span>Owner</span>
                                            {sortField === 'userName' && (
                                                <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('conversationCount')}>
                                        <div className="flex items-center justify-center">
                                            <span>Conversations</span>
                                            {sortField === 'conversationCount' && (
                                                <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('createdAt')}>
                                        <div className="flex items-center justify-center">
                                            <span>Created</span>
                                            {sortField === 'createdAt' && (
                                                <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                {filteredChatbots.length > 0 ? (
                                    filteredChatbots.map((chatbot) => (
                                        <tr key={chatbot.id} className="hover:bg-[#232b3c] transition-colors">
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                                                        <MessageSquare className="h-5 w-5 text-blue-500" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="font-medium">{chatbot.name}</div>
                                                        <div className="text-sm text-gray-400 truncate max-w-xs">{chatbot.description}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(chatbot.status)}`}>
                            {chatbot.status.charAt(0).toUpperCase() + chatbot.status.slice(1)}
                          </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs bg-blue-900/30 text-blue-400 rounded-full">
                            {chatbot.industry.charAt(0).toUpperCase() + chatbot.industry.slice(1)}
                          </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <Link href={`/admin/users/${chatbot.userId}`} className="text-blue-500 hover:text-blue-400">
                                                    {chatbot.userName}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-center">
                                                <div className="text-sm">{chatbot.conversationCount}</div>
                                                <div className="text-xs text-gray-400">{chatbot.conversionRate}% conversion</div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-center">
                                                {formatDate(chatbot.createdAt)}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/admin/chatbots/${chatbot.id}`}
                                                    className="text-blue-500 hover:text-blue-400 mr-4"
                                                >
                                                    View
                                                </Link>
                                                <button
                                                    className="text-red-500 hover:text-red-400"
                                                    onClick={() => handleDelete(chatbot.id, chatbot.name)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                            No chatbots match your search criteria
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Grid View */}
            {!loading && !error && viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredChatbots.length > 0 ? (
                        filteredChatbots.map((chatbot) => (
                            <Link href={`/admin/chatbots/${chatbot.id}`} key={chatbot.id}>
                                <Card className="bg-[#1b2539] border-0 hover:bg-[#232b3c] transition-colors h-full cursor-pointer">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-shrink-0 h-10 w-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                                                <MessageSquare className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(chatbot.status)}`}>
                        {chatbot.status.charAt(0).toUpperCase() + chatbot.status.slice(1)}
                      </span>
                                        </div>

                                        <h3 className="text-lg font-medium mb-2">{chatbot.name}</h3>
                                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{chatbot.description}</p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-1 text-xs bg-blue-900/30 text-blue-400 rounded-full">
                        {chatbot.industry.charAt(0).toUpperCase() + chatbot.industry.slice(1)}
                      </span>
                                            {chatbot.aiEnhanced && (
                                                <span className="px-2 py-1 text-xs bg-purple-900/30 text-purple-400 rounded-full flex items-center">
                          <Zap className="h-3 w-3 mr-1" />
                          AI Enhanced
                        </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <div className="text-xs text-gray-400">Conversations</div>
                                                <div className="font-medium">{chatbot.conversationCount}</div>
                                            </div>

                                            <div>
                                                <div className="text-xs text-gray-400">Conversion Rate</div>
                                                <div className="font-medium">{chatbot.conversionRate}%</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center">
                                                <User className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-blue-500">{chatbot.userName}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-gray-400">{formatDate(chatbot.createdAt)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full">
                            <Card className="bg-[#1b2539] border-0">
                                <CardContent className="p-6 text-center text-gray-400">
                                    No chatbots match your search criteria
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}