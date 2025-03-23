// src/app/admin/users/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
    ArrowLeft,
    User,
    Mail,
    Building,
    Tag,
    Calendar,
    MessageSquare,
    CreditCard,
    Shield,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import Link from 'next/link';

interface User {
    id: string;
    name: string;
    email: string;
    companyName: string;
    industry: string;
    status: 'active' | 'inactive' | 'suspended';
    role: 'admin' | 'user';
    chatbotCount: number;
    subscriptionTier: string;
    subscriptionStatus: 'active' | 'expired' | 'trial';
    createdAt: string;
    lastLogin: string;
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Mock user data - In a real application, you'd fetch from an API
                const mockUser: User = {
                    id: params.id,
                    name: 'John Doe',
                    email: 'john@example.com',
                    companyName: 'Acme Corporation',
                    industry: 'retail',
                    status: 'active',
                    role: 'user',
                    chatbotCount: 3,
                    subscriptionTier: 'Professional',
                    subscriptionStatus: 'active',
                    createdAt: '2023-06-12T10:30:00Z',
                    lastLogin: '2023-08-22T15:45:00Z'
                };

                setUser(mockUser);
            } catch (error) {
                console.error('Error fetching user:', error);
                setError('Failed to load user details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [params.id]);

    // Format date for display
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                    <p className="mt-4">Loading user data...</p>
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
                            href="/admin/users"
                            className="flex items-center text-blue-500 hover:text-blue-400"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Users
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6">
                        <p className="mb-4">User not found.</p>
                        <Link
                            href="/admin/users"
                            className="flex items-center text-blue-500 hover:text-blue-400"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Users
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
                        href="/admin/users"
                        className="mr-4 p-2 rounded-full hover:bg-[#232b3c] transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-2xl font-bold">User Details</h1>
                </div>
                <div className="flex gap-2">
                    <button
                        className="px-4 py-2 border border-blue-600 text-blue-500 rounded-md hover:bg-blue-900/20 transition-colors"
                        onClick={() => router.push(`/admin/users/${params.id}/edit`)}
                    >
                        Edit User
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md ${
                            user.status === 'active'
                                ? 'border border-red-600 text-red-500 hover:bg-red-900/20'
                                : 'bg-green-600 text-white hover:bg-green-700'
                        } transition-colors`}
                        onClick={() => {
                            // This would be an API call in a real application
                            alert(`${user.status === 'active' ? 'Suspend' : 'Activate'} user ${params.id}`);
                        }}
                    >
                        {user.status === 'active' ? 'Suspend User' : 'Activate User'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* User Profile Card */}
                <Card className="bg-[#1b2539] border-0 col-span-1">
                    <CardContent className="p-6">
                        <div className="flex items-center mb-6">
                            <div className="h-20 w-20 rounded-full bg-gray-600 flex items-center justify-center mr-4">
                                <span className="text-2xl font-semibold">{user.name.charAt(0)}</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">{user.name}</h2>
                                <p className="text-gray-400 mb-1">{user.email}</p>
                                <div className="flex space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                      user.status === 'active'
                          ? 'bg-green-900/30 text-green-400'
                          : user.status === 'suspended'
                              ? 'bg-red-900/30 text-red-400'
                              : 'bg-gray-700 text-gray-300'
                  }`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>

                                    {user.role === 'admin' && (
                                        <span className="px-2 py-1 text-xs rounded-full bg-purple-900/30 text-purple-400">
                      Admin
                    </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start">
                                <Building className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-400">Company</p>
                                    <p className="font-medium">{user.companyName}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Tag className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-400">Industry</p>
                                    <p className="font-medium">{user.industry}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-400">Member Since</p>
                                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-400">Last Login</p>
                                    <p className="font-medium">{formatDate(user.lastLogin)}</p>
                                </div>
                            </div>
                        </div>

                        <hr className="my-6 border-gray-700" />

                        <div className="space-y-4">
                            <div className="flex items-start">
                                <CreditCard className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-400">Subscription Plan</p>
                                    <p className="font-medium">{user.subscriptionTier}</p>
                                    <span className={`mt-1 inline-block px-2 py-1 text-xs rounded-full ${
                                        user.subscriptionStatus === 'active'
                                            ? 'bg-green-900/30 text-green-400'
                                            : user.subscriptionStatus === 'trial'
                                                ? 'bg-blue-900/30 text-blue-400'
                                                : 'bg-red-900/30 text-red-400'
                                    }`}>
                    {user.subscriptionStatus.charAt(0).toUpperCase() + user.subscriptionStatus.slice(1)}
                  </span>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <MessageSquare className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-400">Chatbots</p>
                                    <p className="font-medium">{user.chatbotCount}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Activity and Details Sections */}
                <div className="col-span-1 xl:col-span-2 space-y-6">
                    {/* Recent Activity */}
                    <Card className="bg-[#1b2539] border-0">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* We'd fetch this from an API in a real application */}
                                <div className="border border-gray-700 rounded-lg p-4">
                                    <div className="flex justify-between mb-2">
                                        <div className="flex items-center">
                                            <MessageSquare className="h-5 w-5 text-blue-500 mr-2" />
                                            <span className="font-medium">Created a new chatbot</span>
                                        </div>
                                        <span className="text-sm text-gray-400">{new Date(Date.now() - 2*24*60*60*1000).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-400">Created "Customer Support" chatbot for fashion industry</p>
                                </div>

                                <div className="border border-gray-700 rounded-lg p-4">
                                    <div className="flex justify-between mb-2">
                                        <div className="flex items-center">
                                            <CreditCard className="h-5 w-5 text-green-500 mr-2" />
                                            <span className="font-medium">Subscription payment</span>
                                        </div>
                                        <span className="text-sm text-gray-400">{new Date(Date.now() - 7*24*60*60*1000).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-400">Paid $49.99 for Professional plan monthly renewal</p>
                                </div>

                                <div className="border border-gray-700 rounded-lg p-4">
                                    <div className="flex justify-between mb-2">
                                        <div className="flex items-center">
                                            <Shield className="h-5 w-5 text-yellow-500 mr-2" />
                                            <span className="font-medium">Account login</span>
                                        </div>
                                        <span className="text-sm text-gray-400">{new Date(Date.now() - 10*24*60*60*1000).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-400">Logged in from a new device (Chrome on Windows)</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Settings */}
                    <Card className="bg-[#1b2539] border-0">
                        <CardHeader>
                            <CardTitle>Security & Permissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">Two-Factor Authentication</h3>
                                        <p className="text-sm text-gray-400">Enhance account security with 2FA</p>
                                    </div>
                                    <div className="flex items-center">
                                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                                        <span>Not Enabled</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">Email Verification</h3>
                                        <p className="text-sm text-gray-400">User has verified their email address</p>
                                    </div>
                                    <div className="flex items-center">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                        <span>Verified</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">Admin Access</h3>
                                        <p className="text-sm text-gray-400">Can access admin dashboard and features</p>
                                    </div>
                                    <div className="flex items-center">
                                        {user.role === 'admin' ? (
                                            <>
                                                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                                <span>Granted</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                                                <span>Not Granted</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">API Access</h3>
                                        <p className="text-sm text-gray-400">Can use the API to integrate with other systems</p>
                                    </div>
                                    <div className="flex items-center">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                        <span>Granted</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* User's Chatbots */}
                    <Card className="bg-[#1b2539] border-0">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Chatbots</CardTitle>
                            <Link
                                href={`/admin/users/${params.id}/chatbots`}
                                className="text-sm text-blue-500 hover:text-blue-400"
                            >
                                View All →
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Mock chatbot data - In a real app, fetch this from an API */}
                                <div className="border border-gray-700 rounded-lg p-4 hover:bg-[#232b3c] transition-colors">
                                    <div className="flex justify-between mb-2">
                                        <div className="font-medium">Customer Support</div>
                                        <span className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded-full">Active</span>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-3">Handles customer inquiries about products and orders</p>
                                    <div className="text-xs text-gray-500">Created: {new Date(Date.now() - 30*24*60*60*1000).toLocaleDateString()}</div>
                                </div>

                                <div className="border border-gray-700 rounded-lg p-4 hover:bg-[#232b3c] transition-colors">
                                    <div className="flex justify-between mb-2">
                                        <div className="font-medium">Sales Assistant</div>
                                        <span className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded-full">Active</span>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-3">Helps customers find products and make purchase decisions</p>
                                    <div className="text-xs text-gray-500">Created: {new Date(Date.now() - 60*24*60*60*1000).toLocaleDateString()}</div>
                                </div>

                                <div className="border border-gray-700 rounded-lg p-4 hover:bg-[#232b3c] transition-colors">
                                    <div className="flex justify-between mb-2">
                                        <div className="font-medium">Order Tracker</div>
                                        <span className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded-full">Active</span>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-3">Allows customers to track their order status</p>
                                    <div className="text-xs text-gray-500">Created: {new Date(Date.now() - 90*24*60*60*1000).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}