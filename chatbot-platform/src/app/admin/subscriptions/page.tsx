// src/app/admin/subscriptions/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
    Search,
    ChevronDown,
    Download,
    PlusCircle,
    Trello,
    List
} from 'lucide-react';
import Link from 'next/link';

interface Subscription {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    companyName: string;
    plan: 'basic' | 'professional' | 'enterprise';
    status: 'active' | 'expired' | 'canceled' | 'trial';
    startDate: string;
    endDate: string;
    renewalDate: string;
    amount: number;
    interval: 'monthly' | 'annual';
    paymentMethod: string;
    lastPaymentDate: string;
    chatbotLimit: number;
    chatbotsUsed: number;
}

export default function AdminSubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterPlan, setFilterPlan] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
    const [sortField, setSortField] = useState<string>('renewalDate');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        // In a real application, this would be an API call
        const fetchSubscriptions = async () => {
            setLoading(true);
            try {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Mocked subscription data
                const mockSubscriptions: Subscription[] = [
                    {
                        id: '1',
                        userId: '1',
                        userName: 'John Doe',
                        userEmail: 'john@example.com',
                        companyName: 'Acme Inc',
                        plan: 'professional',
                        status: 'active',
                        startDate: '2023-01-15T00:00:00Z',
                        endDate: '2024-01-15T00:00:00Z',
                        renewalDate: '2024-01-15T00:00:00Z',
                        amount: 49.99,
                        interval: 'monthly',
                        paymentMethod: 'credit_card',
                        lastPaymentDate: '2023-07-15T00:00:00Z',
                        chatbotLimit: 5,
                        chatbotsUsed: 3
                    },
                    {
                        id: '2',
                        userId: '2',
                        userName: 'Jane Smith',
                        userEmail: 'jane@example.com',
                        companyName: 'Tech Solutions',
                        plan: 'enterprise',
                        status: 'active',
                        startDate: '2022-11-10T00:00:00Z',
                        endDate: '2023-11-10T00:00:00Z',
                        renewalDate: '2023-11-10T00:00:00Z',
                        amount: 199.99,
                        interval: 'monthly',
                        paymentMethod: 'credit_card',
                        lastPaymentDate: '2023-08-10T00:00:00Z',
                        chatbotLimit: 15,
                        chatbotsUsed: 5
                    },
                    {
                        id: '3',
                        userId: '3',
                        userName: 'Bob Johnson',
                        userEmail: 'bob@example.com',
                        companyName: 'FashionHub',
                        plan: 'basic',
                        status: 'expired',
                        startDate: '2023-02-20T00:00:00Z',
                        endDate: '2023-08-20T00:00:00Z',
                        renewalDate: '2023-08-20T00:00:00Z',
                        amount: 19.99,
                        interval: 'monthly',
                        paymentMethod: 'paypal',
                        lastPaymentDate: '2023-07-20T00:00:00Z',
                        chatbotLimit: 2,
                        chatbotsUsed: 1
                    },
                    {
                        id: '4',
                        userId: '4',
                        userName: 'Alice Williams',
                        userEmail: 'alice@example.com',
                        companyName: 'Food Delivery Co',
                        plan: 'professional',
                        status: 'active',
                        startDate: '2023-03-05T00:00:00Z',
                        endDate: '2024-03-05T00:00:00Z',
                        renewalDate: '2024-03-05T00:00:00Z',
                        amount: 479.88,
                        interval: 'annual',
                        paymentMethod: 'bank_transfer',
                        lastPaymentDate: '2023-03-05T00:00:00Z',
                        chatbotLimit: 5,
                        chatbotsUsed: 2
                    },
                    {
                        id: '5',
                        userId: '5',
                        userName: 'Charlie Brown',
                        userEmail: 'charlie@example.com',
                        companyName: 'Beauty Shop',
                        plan: 'basic',
                        status: 'canceled',
                        startDate: '2023-04-10T00:00:00Z',
                        endDate: '2023-10-10T00:00:00Z',
                        renewalDate: '2023-10-10T00:00:00Z',
                        amount: 19.99,
                        interval: 'monthly',
                        paymentMethod: 'credit_card',
                        lastPaymentDate: '2023-08-10T00:00:00Z',
                        chatbotLimit: 2,
                        chatbotsUsed: 0
                    },
                    {
                        id: '6',
                        userId: '6',
                        userName: 'David Wilson',
                        userEmail: 'david@example.com',
                        companyName: 'Sports Gear',
                        plan: 'professional',
                        status: 'trial',
                        startDate: '2023-08-01T00:00:00Z',
                        endDate: '2023-08-15T00:00:00Z',
                        renewalDate: '2023-08-15T00:00:00Z',
                        amount: 0,
                        interval: 'monthly',
                        paymentMethod: 'none',
                        lastPaymentDate: '',
                        chatbotLimit: 5,
                        chatbotsUsed: 1
                    }
                ];

                setSubscriptions(mockSubscriptions);
            } catch (error) {
                console.error('Error fetching subscriptions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptions();
    }, []);

    // Filter and sort subscriptions
    const filteredSubscriptions = subscriptions.filter(subscription => {
        // Search term filter (search by name, email, or company)
        const searchMatch =
            subscription.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subscription.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subscription.companyName.toLowerCase().includes(searchTerm.toLowerCase());

        // Plan filter
        const planMatch = filterPlan === 'all' || subscription.plan === filterPlan;

        // Status filter
        const statusMatch = filterStatus === 'all' || subscription.status === filterStatus;

        return searchMatch && planMatch && statusMatch;
    }).sort((a, b) => {
        // Type assertion to access dynamic properties
        const aValue = a[sortField as keyof Subscription];
        const bValue = b[sortField as keyof Subscription];

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
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Get subscription status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-900/30 text-green-400';
            case 'trial':
                return 'bg-blue-900/30 text-blue-400';
            case 'expired':
                return 'bg-red-900/30 text-red-400';
            case 'canceled':
                return 'bg-gray-700 text-gray-300';
            default:
                return 'bg-gray-700 text-gray-300';
        }
    };

    // Get plan display name and color
    const getPlanInfo = (plan: string) => {
        switch (plan) {
            case 'basic':
                return {name: 'Basic', color: 'bg-gray-700 text-gray-300'};
            case 'professional':
                return {name: 'Professional', color: 'bg-blue-900/30 text-blue-400'};
            case 'enterprise':
                return {name: 'Enterprise', color: 'bg-purple-900/30 text-purple-400'};
            default:
                return {name: plan, color: 'bg-gray-700 text-gray-300'};
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold">Subscription Management</h1>

                <div className="flex flex-wrap gap-2">
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center">
                        <PlusCircle className="h-4 w-4 mr-2"/>
                        <span>Create Plan</span>
                    </button>
                    <button
                        className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors flex items-center">
                        <Download className="h-4 w-4 mr-2"/>
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative col-span-1 md:col-span-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4"/>
                    <input
                        type="text"
                        placeholder="Search subscriptions..."
                        className="w-full pl-10 pr-4 py-2 bg-[#232b3c] border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="relative">
                    <select
                        className="w-full py-2 px-4 bg-[#232b3c] border border-gray-700 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={filterPlan}
                        onChange={(e) => setFilterPlan(e.target.value)}
                    >
                        <option value="all">All Plans</option>
                        <option value="basic">Basic</option>
                        <option value="professional">Professional</option>
                        <option value="enterprise">Enterprise</option>
                    </select>
                    <ChevronDown
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 pointer-events-none"/>
                </div>

                <div className="relative">
                    <select
                        className="w-full py-2 px-4 bg-[#232b3c] border border-gray-700 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="trial">Trial</option>
                        <option value="expired">Expired</option>
                        <option value="canceled">Canceled</option>
                    </select>
                    <ChevronDown
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 pointer-events-none"/>
                </div>

                <div className="flex justify-end">
                    <div className="bg-[#232b3c] border border-gray-700 rounded-md overflow-hidden flex">
                        <button
                            className={`px-3 py-2 flex items-center ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-5 w-5"/>
                        </button>
                        <button
                            className={`px-3 py-2 flex items-center ${viewMode === 'card' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
                            onClick={() => setViewMode('card')}
                        >
                            <Trello className="h-5 w-5"/>
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading state */}
            {loading && (
                <div className="flex justify-center items-center py-20">
                    <div
                        className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <span className="ml-3">Loading subscriptions...</span>
                </div>
            )}

            {/* Subscription List View */}
            {!loading && viewMode === 'list' && (
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="bg-[#232b3c] border-b border-gray-700">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('userName')}>
                                        <div className="flex items-center">
                                            <span>Subscriber</span>
                                            {sortField === 'userName' && (
                                                <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('plan')}>
                                        <div className="flex items-center">
                                            <span>Plan</span>
                                            {sortField === 'plan' && (
                                                <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('status')}>
                                        <div className="flex items-center">
                                            <span>Status</span>
                                            {sortField === 'status' && (
                                                <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <span>Amount</span>
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('renewalDate')}>
                                        <div className="flex items-center">
                                            <span>Renewal</span>
                                            {sortField === 'renewalDate' && (
                                                <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <span>Usage</span>
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                {filteredSubscriptions.length > 0 ? (
                                    filteredSubscriptions.map((subscription) => (
                                        <tr key={subscription.id} className="hover:bg-[#232b3c] transition-colors">
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div
                                                        className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                                                        <span
                                                            className="text-lg font-semibold">{subscription.userName.charAt(0)}</span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="font-medium">{subscription.userName}</div>
                                                        <div
                                                            className="text-sm text-gray-400">{subscription.userEmail}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getPlanInfo(subscription.plan).color}`}>
                            {getPlanInfo(subscription.plan).name}
                          </span>
                                                <div className="text-sm text-gray-400 mt-1">
                                                    {subscription.interval === 'monthly' ? 'Monthly' : 'Annual'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(subscription.status)}`}>
                            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                          </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm">
                                                    {formatCurrency(subscription.amount)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm">
                                                    {formatDate(subscription.renewalDate)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="w-full bg-gray-700 rounded-full h-2.5">
                                                    <div
                                                        className="bg-blue-600 h-2.5 rounded-full"
                                                        style={{width: `${(subscription.chatbotsUsed / subscription.chatbotLimit) * 100}%`}}
                                                    ></div>
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {subscription.chatbotsUsed} / {subscription.chatbotLimit} chatbots
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/admin/subscriptions/${subscription.id}`}
                                                    className="text-blue-500 hover:text-blue-400 mr-4"
                                                >
                                                    View
                                                </Link>
                                                <button
                                                    className="text-gray-400 hover:text-white"
                                                    onClick={() => alert(`Edit subscription ${subscription.id}`)}
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                            No subscriptions match your search criteria
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Subscription Card View */}
            {!loading && viewMode === 'card' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSubscriptions.length > 0 ? (
                        filteredSubscriptions.map((subscription) => (
                            <Link href={`/admin/subscriptions/${subscription.id}`} key={subscription.id}>
                                <Card
                                    className="bg-[#1b2539] border-0 hover:bg-[#232b3c] transition-colors h-full cursor-pointer">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center">
                                                <div
                                                    className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                                                    <span
                                                        className="text-lg font-semibold">{subscription.userName.charAt(0)}</span>
                                                </div>
                                                <div className="ml-3">
                                                    <div className="font-medium">{subscription.userName}</div>
                                                    <div
                                                        className="text-sm text-gray-400">{subscription.companyName}</div>
                                                </div>
                                            </div>
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${getStatusColor(subscription.status)}`}>
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </span>
                                        </div>

                                        <div className="mb-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPlanInfo(subscription.plan).color}`}>
                        {getPlanInfo(subscription.plan).name}
                      </span>
                                            <span className="text-sm text-gray-400 ml-2">
                        {subscription.interval === 'monthly' ? 'Monthly' : 'Annual'}
                      </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <div className="text-xs text-gray-400">Amount</div>
                                                <div className="font-medium">{formatCurrency(subscription.amount)}</div>
                                            </div>

                                            <div>
                                                <div className="text-xs text-gray-400">Renewal Date</div>
                                                <div
                                                    className="font-medium">{formatDate(subscription.renewalDate)}</div>
                                            </div>
                                        </div>

                                        <div className="mb-1">
                                            <div className="text-xs text-gray-400 mb-1">Chatbot Usage</div>
                                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                                <div
                                                    className="bg-blue-600 h-2.5 rounded-full"
                                                    style={{width: `${(subscription.chatbotsUsed / subscription.chatbotLimit) * 100}%`}}
                                                ></div>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1 text-right">
                                                {subscription.chatbotsUsed} / {subscription.chatbotLimit} chatbots
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
                                    No subscriptions match your search criteria
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}