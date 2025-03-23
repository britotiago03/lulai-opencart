// src/app/admin/users/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
    Search,
    Filter,
    MoreVertical,
    Check,
    X,
    ChevronDown,
    UserPlus,
    Download
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

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [sortField, setSortField] = useState<string>('createdAt');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        // In a real application, this would be an API call
        const fetchUsers = async () => {
            setLoading(true);
            try {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Mocked users data
                const mockUsers: User[] = [
                    {
                        id: '1',
                        name: 'John Doe',
                        email: 'john@example.com',
                        companyName: 'Acme Inc',
                        industry: 'retail',
                        status: 'active',
                        role: 'user',
                        chatbotCount: 3,
                        subscriptionTier: 'Professional',
                        subscriptionStatus: 'active',
                        createdAt: '2023-06-12T10:30:00Z',
                        lastLogin: '2023-08-22T15:45:00Z'
                    },
                    {
                        id: '2',
                        name: 'Jane Smith',
                        email: 'jane@example.com',
                        companyName: 'Tech Solutions',
                        industry: 'electronics',
                        status: 'active',
                        role: 'admin',
                        chatbotCount: 5,
                        subscriptionTier: 'Enterprise',
                        subscriptionStatus: 'active',
                        createdAt: '2023-05-05T09:00:00Z',
                        lastLogin: '2023-08-21T11:23:00Z'
                    },
                    {
                        id: '3',
                        name: 'Bob Johnson',
                        email: 'bob@example.com',
                        companyName: 'FashionHub',
                        industry: 'fashion',
                        status: 'inactive',
                        role: 'user',
                        chatbotCount: 1,
                        subscriptionTier: 'Basic',
                        subscriptionStatus: 'expired',
                        createdAt: '2023-07-30T14:15:00Z',
                        lastLogin: '2023-08-10T09:30:00Z'
                    },
                    {
                        id: '4',
                        name: 'Alice Williams',
                        email: 'alice@example.com',
                        companyName: 'Food Delivery Co',
                        industry: 'food',
                        status: 'active',
                        role: 'user',
                        chatbotCount: 2,
                        subscriptionTier: 'Professional',
                        subscriptionStatus: 'active',
                        createdAt: '2023-04-18T11:20:00Z',
                        lastLogin: '2023-08-22T10:15:00Z'
                    },
                    {
                        id: '5',
                        name: 'Charlie Brown',
                        email: 'charlie@example.com',
                        companyName: 'Beauty Shop',
                        industry: 'beauty',
                        status: 'suspended',
                        role: 'user',
                        chatbotCount: 0,
                        subscriptionTier: 'Basic',
                        subscriptionStatus: 'expired',
                        createdAt: '2023-03-05T16:45:00Z',
                        lastLogin: '2023-07-01T13:10:00Z'
                    }
                ];

                setUsers(mockUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Filter and sort users
    const filteredUsers = users.filter(user => {
        // Search term filter
        const searchMatch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.companyName.toLowerCase().includes(searchTerm.toLowerCase());

        // Status filter
        const statusMatch = filterStatus === 'all' || user.status === filterStatus;

        // Role filter
        const roleMatch = filterRole === 'all' || user.role === filterRole;

        return searchMatch && statusMatch && roleMatch;
    }).sort((a, b) => {
        // Type assertion to access dynamic properties
        const aValue = a[sortField as keyof User];
        const bValue = b[sortField as keyof User];

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

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold">User Management</h1>

                <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center">
                        <UserPlus className="h-4 w-4 mr-2" />
                        <span>Add User</span>
                    </button>
                    <button className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors flex items-center">
                        <Download className="h-4 w-4 mr-2" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative col-span-1 md:col-span-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search users..."
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
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 pointer-events-none" />
                </div>
            </div>

            {/* Users Table */}
            <Card className="bg-[#1b2539] border-0">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                            <span className="ml-3">Loading users...</span>
                        </div>
                    ) : (
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
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Company</th>
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
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('subscriptionTier')}>
                                        <div className="flex items-center">
                                            <span>Subscription</span>
                                            {sortField === 'subscriptionTier' && (
                                                <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('chatbotCount')}>
                                        <div className="flex items-center">
                                            <span>Chatbots</span>
                                            {sortField === 'chatbotCount' && (
                                                <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('createdAt')}>
                                        <div className="flex items-center">
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
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-[#232b3c] transition-colors">
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                                                        <span className="text-lg font-semibold">{user.name.charAt(0)}</span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="font-medium">{user.name}</div>
                                                        <div className="text-sm text-gray-400">
                                                            {user.role === 'admin' ? (
                                                                <span className="px-2 py-1 text-xs rounded-full bg-purple-900/30 text-purple-400">
                                    Admin
                                  </span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">{user.email}</td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm">{user.companyName}</div>
                                                <div className="text-sm text-gray-400">{user.industry}</div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {user.status === 'active' ? (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-green-900/30 text-green-400">
                              Active
                            </span>
                                                ) : user.status === 'inactive' ? (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">
                              Inactive
                            </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-red-900/30 text-red-400">
                              Suspended
                            </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm">
                                                    {user.subscriptionTier}
                                                    {user.subscriptionStatus === 'active' ? (
                                                        <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-900/30 text-blue-400">
                                Active
                              </span>
                                                    ) : user.subscriptionStatus === 'trial' ? (
                                                        <span className="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-900/30 text-yellow-400">
                                Trial
                              </span>
                                                    ) : (
                                                        <span className="ml-2 px-2 py-1 text-xs rounded-full bg-red-900/30 text-red-400">
                                Expired
                              </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">{user.chatbotCount}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">{formatDate(user.createdAt)}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/admin/users/${user.id}`}
                                                    className="text-blue-500 hover:text-blue-400 mr-4"
                                                >
                                                    View
                                                </Link>
                                                <button
                                                    className="text-gray-400 hover:text-white"
                                                    onClick={() => alert(`Edit user ${user.id}`)}
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                                            No users match your search criteria
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}