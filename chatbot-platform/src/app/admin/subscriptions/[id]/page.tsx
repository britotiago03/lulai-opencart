// src/app/admin/subscriptions/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { use } from 'react'; // Import React.use
import {
    ArrowLeft,
    User,
    CreditCard,
    Calendar,
    Clock,
    Package,
    RefreshCw,
    CheckCircle,
    XCircle,
    BarChart3,
    MessageSquare,
    FileText,
    Shield,
    AlertTriangle,
    Mail,
    Tag
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
    nextPaymentDate: string;
    chatbotLimit: number;
    chatbotsUsed: number;
    paymentHistory: {
        id: string;
        date: string;
        amount: number;
        status: 'succeeded' | 'failed' | 'refunded';
        method: string;
    }[];
}

interface SubscriptionDetailPageProps {
    params: {
        id: string;
    };
}

export default function SubscriptionDetailPage({ params }: SubscriptionDetailPageProps) {
    // Unwrap params using React.use()
    const unwrappedParams = use(params);
    const id = unwrappedParams.id;

    const router = useRouter();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                setLoading(true);
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Mock subscription data - In a real application, you'd fetch from an API
                const mockSubscription: Subscription = {
                    id: id, // Use the unwrapped id
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
                    nextPaymentDate: '2023-09-15T00:00:00Z',
                    chatbotLimit: 5,
                    chatbotsUsed: 3,
                    paymentHistory: [
                        {
                            id: 'pay_1',
                            date: '2023-07-15T00:00:00Z',
                            amount: 49.99,
                            status: 'succeeded',
                            method: 'Visa ending in 4242'
                        },
                        {
                            id: 'pay_2',
                            date: '2023-06-15T00:00:00Z',
                            amount: 49.99,
                            status: 'succeeded',
                            method: 'Visa ending in 4242'
                        },
                        {
                            id: 'pay_3',
                            date: '2023-05-15T00:00:00Z',
                            amount: 49.99,
                            status: 'succeeded',
                            method: 'Visa ending in 4242'
                        },
                        {
                            id: 'pay_4',
                            date: '2023-04-15T00:00:00Z',
                            amount: 49.99,
                            status: 'succeeded',
                            method: 'Visa ending in 4242'
                        }
                    ]
                };

                setSubscription(mockSubscription);
            } catch (error) {
                console.error('Error fetching subscription:', error);
                setError('Failed to load subscription details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchSubscription();
    }, [id]); // Use unwrapped id in dependency array

    // Format date for display
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
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

    // Get plan display name and color
    const getPlanInfo = (plan: string) => {
        switch (plan) {
            case 'basic':
                return { name: 'Basic', color: 'bg-gray-700 text-gray-300' };
            case 'professional':
                return { name: 'Professional', color: 'bg-blue-900/30 text-blue-400' };
            case 'enterprise':
                return { name: 'Enterprise', color: 'bg-purple-900/30 text-purple-400' };
            default:
                return { name: plan, color: 'bg-gray-700 text-gray-300' };
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

    // Payment status color
    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'succeeded':
                return 'text-green-400';
            case 'failed':
                return 'text-red-400';
            case 'refunded':
                return 'text-yellow-400';
            default:
                return 'text-gray-400';
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                    <p className="mt-4">Loading subscription data...</p>
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
                            href="/admin/subscriptions"
                            className="flex items-center text-blue-500 hover:text-blue-400"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Subscriptions
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6">
                        <p className="mb-4">Subscription not found.</p>
                        <Link
                            href="/admin/subscriptions"
                            className="flex items-center text-blue-500 hover:text-blue-400"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Subscriptions
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const daysUntilRenewal = Math.ceil(
        (new Date(subscription.renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6 flex justify-between items-center">
                <div className="flex items-center">
                    <Link
                        href="/admin/subscriptions"
                        className="mr-4 p-2 rounded-full hover:bg-[#232b3c] transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-2xl font-bold">Subscription Details</h1>
                </div>
                <div className="flex gap-2">
                    <button
                        className="px-4 py-2 border border-blue-600 text-blue-500 rounded-md hover:bg-blue-900/20 transition-colors"
                        onClick={() => router.push(`/admin/subscriptions/${params.id}/edit`)}
                    >
                        Edit Subscription
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md ${
                            subscription.status === 'active'
                                ? 'border border-red-600 text-red-500 hover:bg-red-900/20'
                                : 'bg-green-600 text-white hover:bg-green-700'
                        } transition-colors`}
                        onClick={() => {
                            // This would be an API call in a real application
                            alert(`${subscription.status === 'active' ? 'Cancel' : 'Reactivate'} subscription ${params.id}`);
                        }}
                    >
                        {subscription.status === 'active' ? 'Cancel Subscription' : 'Reactivate Subscription'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Subscription Info Card */}
                <Card className="bg-[#1b2539] border-0 col-span-1">
                    <CardContent className="p-6">
                        <div className="mb-6">
                            <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 text-xs rounded-full ${getPlanInfo(subscription.plan).color}`}>
                  {getPlanInfo(subscription.plan).name}
                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(subscription.status)}`}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
                            </div>

                            <h2 className="text-xl font-semibold">{formatCurrency(subscription.amount)} / {subscription.interval}</h2>
                            <p className="text-gray-400 text-sm">
                                Next renewal in {daysUntilRenewal} days ({formatDate(subscription.renewalDate)})
                            </p>
                        </div>

                        <div className="flex items-center mb-6">
                            <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center mr-3">
                                <span className="text-lg font-semibold">{subscription.userName.charAt(0)}</span>
                            </div>
                            <div>
                                <div className="font-medium">{subscription.userName}</div>
                                <div className="text-sm text-gray-400">{subscription.companyName}</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start">
                                <Mail className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-400">Email</p>
                                    <p className="font-medium">{subscription.userEmail}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-400">Start Date</p>
                                    <p className="font-medium">{formatDate(subscription.startDate)}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-400">End Date</p>
                                    <p className="font-medium">{formatDate(subscription.endDate)}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <CreditCard className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-400">Payment Method</p>
                                    <p className="font-medium">
                                        {subscription.paymentMethod === 'credit_card' ? 'Credit Card' :
                                            subscription.paymentMethod === 'paypal' ? 'PayPal' :
                                                subscription.paymentMethod}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <RefreshCw className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-400">Billing Cycle</p>
                                    <p className="font-medium">{subscription.interval.charAt(0).toUpperCase() + subscription.interval.slice(1)}</p>
                                </div>
                            </div>
                        </div>

                        <hr className="my-6 border-gray-700" />

                        <div>
                            <h3 className="font-semibold mb-3">Chatbot Usage</h3>
                            <div className="mb-2">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Used</span>
                                    <span>{subscription.chatbotsUsed} / {subscription.chatbotLimit}</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${(subscription.chatbotsUsed / subscription.chatbotLimit) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400">
                                {subscription.chatbotLimit - subscription.chatbotsUsed} chatbot slots remaining
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Details Sections */}
                <div className="col-span-1 xl:col-span-2 space-y-6">
                    {/* Payment History */}
                    <Card className="bg-[#1b2539] border-0">
                        <CardHeader>
                            <CardTitle>Payment History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b border-gray-700">
                                    <tr>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Method</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                    {subscription.paymentHistory.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-[#232b3c] transition-colors">
                                            <td className="py-3 px-4">{formatDate(payment.date)}</td>
                                            <td className="py-3 px-4">{formatCurrency(payment.amount)}</td>
                                            <td className="py-3 px-4">{payment.method}</td>
                                            <td className="py-3 px-4">
                          <span className={`inline-flex items-center ${getPaymentStatusColor(payment.status)}`}>
                            {payment.status === 'succeeded' ? (
                                <CheckCircle className="h-4 w-4 mr-1" />
                            ) : payment.status === 'failed' ? (
                                <XCircle className="h-4 w-4 mr-1" />
                            ) : (
                                <RefreshCw className="h-4 w-4 mr-1" />
                            )}
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    className="text-sm text-blue-500 hover:text-blue-400 mr-3"
                                                    onClick={() => {
                                                        // This would be an API call in a real application
                                                        alert(`View invoice for payment ${payment.id}`);
                                                    }}
                                                >
                                                    View Invoice
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Charges */}
                    <Card className="bg-[#1b2539] border-0">
                        <CardHeader>
                            <CardTitle>Upcoming Charges</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
                                <div className="flex items-center">
                                    <Calendar className="h-5 w-5 text-blue-500 mr-3" />
                                    <div>
                                        <p className="font-medium">{formatCurrency(subscription.amount)}</p>
                                        <p className="text-sm text-gray-400">
                                            Next charge on {formatDate(subscription.nextPaymentDate)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    className="px-3 py-1 text-sm border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
                                    onClick={() => {
                                        // This would be an API call in a real application
                                        alert('Edit payment details');
                                    }}
                                >
                                    Update Payment Method
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upgrade Options */}
                    <Card className="bg-[#1b2539] border-0">
                        <CardHeader>
                            <CardTitle>Plan Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border border-gray-700 rounded-lg p-4 hover:bg-[#232b3c] transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-medium">Upgrade Plan</span>
                                        <Package className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <p className="text-sm text-gray-400 mb-4">Upgrade this user's subscription to a higher tier</p>
                                    <button
                                        className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        onClick={() => {
                                            // This would be an API call in a real application
                                            alert('Upgrade subscription');
                                        }}
                                    >
                                        View Upgrade Options
                                    </button>
                                </div>

                                <div className="border border-gray-700 rounded-lg p-4 hover:bg-[#232b3c] transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-medium">Change Billing Cycle</span>
                                        <RefreshCw className="h-5 w-5 text-green-500" />
                                    </div>
                                    <p className="text-sm text-gray-400 mb-4">Switch between monthly and annual billing</p>
                                    <button
                                        className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                        onClick={() => {
                                            // This would be an API call in a real application
                                            alert('Change billing cycle');
                                        }}
                                    >
                                        Change Cycle
                                    </button>
                                </div>

                                <div className="border border-gray-700 rounded-lg p-4 hover:bg-[#232b3c] transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-medium">Apply Coupon</span>
                                        <Tag className="h-5 w-5 text-yellow-500" />
                                    </div>
                                    <p className="text-sm text-gray-400 mb-4">Apply a discount coupon to this subscription</p>
                                    <button
                                        className="w-full px-3 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
                                        onClick={() => {
                                            // This would be an API call in a real application
                                            alert('Apply coupon');
                                        }}
                                    >
                                        Apply Coupon
                                    </button>
                                </div>

                                <div className="border border-gray-700 rounded-lg p-4 hover:bg-[#232b3c] transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-medium">Extend Subscription</span>
                                        <Calendar className="h-5 w-5 text-purple-500" />
                                    </div>
                                    <p className="text-sm text-gray-400 mb-4">Manually extend the subscription end date</p>
                                    <button
                                        className="w-full px-3 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
                                        onClick={() => {
                                            // This would be an API call in a real application
                                            alert('Extend subscription');
                                        }}
                                    >
                                        Extend Subscription
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions & Notes */}
                    <Card className="bg-[#1b2539] border-0">
                        <CardHeader>
                            <CardTitle>Admin Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    className="flex flex-col items-center justify-center p-4 border border-gray-700 rounded-lg hover:bg-[#232b3c] transition-colors"
                                    onClick={() => {
                                        // This would be an API call in a real application
                                        alert('Send invoice');
                                    }}
                                >
                                    <FileText className="h-6 w-6 text-blue-500 mb-2" />
                                    <span className="text-sm">Send Invoice</span>
                                </button>

                                <button
                                    className="flex flex-col items-center justify-center p-4 border border-gray-700 rounded-lg hover:bg-[#232b3c] transition-colors"
                                    onClick={() => {
                                        // This would be an API call in a real application
                                        alert('Issue refund');
                                    }}
                                >
                                    <RefreshCw className="h-6 w-6 text-yellow-500 mb-2" />
                                    <span className="text-sm">Issue Refund</span>
                                </button>

                                <button
                                    className="flex flex-col items-center justify-center p-4 border border-gray-700 rounded-lg hover:bg-[#232b3c] transition-colors"
                                    onClick={() => {
                                        // This would be an API call in a real application
                                        alert('View user profile');
                                        router.push(`/admin/users/${subscription.userId}`);
                                    }}
                                >
                                    <User className="h-6 w-6 text-green-500 mb-2" />
                                    <span className="text-sm">View User</span>
                                </button>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Admin Notes
                                </label>
                                <textarea
                                    className="w-full p-3 bg-[#232b3c] border border-gray-700 rounded-md text-white resize-none"
                                    rows={4}
                                    placeholder="Add notes about this subscription..."
                                ></textarea>
                                <div className="mt-2 flex justify-end">
                                    <button
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Save Notes
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}