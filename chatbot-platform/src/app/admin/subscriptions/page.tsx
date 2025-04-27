"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Search, User, Calendar, RefreshCcw } from "lucide-react";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";

// Types based on your SQL schema
interface Subscription {
    id: number;
    user_id: string;
    user_name?: string;
    user_email?: string;
    plan_type: 'free' | 'basic' | 'pro';
    price: number;
    status: 'active' | 'cancelled' | 'expired';
    payment_method?: string;
    payment_id?: string;
    created_at: string;
    start_date: string;
    end_date?: string;
    last_updated: string;
}

export default function AdminSubscriptionsPage() {
    const { isLoading, isAdmin } = useAdminAuth();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
    const [fetchingData, setFetchingData] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [planFilter, setPlanFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Sample data based on your schema
    const sampleSubscriptions: Subscription[] = [
        {
            id: 1,
            user_id: "u_123456",
            user_name: "John Smith",
            user_email: "john@example.com",
            plan_type: "pro",
            price: 29.99,
            status: "active",
            payment_method: "stripe",
            payment_id: "pi_1N7HjrLkd7H3Z4X",
            created_at: "2024-02-15T10:24:32Z",
            start_date: "2024-02-15T10:24:32Z",
            end_date: "2025-02-15T10:24:32Z",
            last_updated: "2024-02-15T10:24:32Z"
        },
        {
            id: 2,
            user_id: "u_789012",
            user_name: "Jane Doe",
            user_email: "jane@example.com",
            plan_type: "basic",
            price: 9.99,
            status: "active",
            payment_method: "paypal",
            payment_id: "PAY-4X7Y8Z9A0B",
            created_at: "2024-03-01T14:15:22Z",
            start_date: "2024-03-01T14:15:22Z",
            end_date: "2025-03-01T14:15:22Z",
            last_updated: "2024-03-01T14:15:22Z"
        },
        {
            id: 3,
            user_id: "u_345678",
            user_name: "Robert Johnson",
            user_email: "robert@example.com",
            plan_type: "pro",
            price: 29.99,
            status: "cancelled",
            payment_method: "stripe",
            payment_id: "pi_2O8IksLkd7H3Z4X",
            created_at: "2024-01-10T09:12:45Z",
            start_date: "2024-01-10T09:12:45Z",
            end_date: "2024-04-10T09:12:45Z",
            last_updated: "2024-03-15T16:30:12Z"
        },
        {
            id: 4,
            user_id: "u_901234",
            user_name: "Sarah Williams",
            user_email: "sarah@example.com",
            plan_type: "free",
            price: 0.00,
            status: "active",
            created_at: "2024-03-20T11:42:18Z",
            start_date: "2024-03-20T11:42:18Z",
            last_updated: "2024-03-20T11:42:18Z"
        },
        {
            id: 5,
            user_id: "u_567890",
            user_name: "Michael Brown",
            user_email: "michael@example.com",
            plan_type: "basic",
            price: 9.99,
            status: "expired",
            payment_method: "stripe",
            payment_id: "pi_3P9JltLkd7H3Z4X",
            created_at: "2023-09-05T08:30:00Z",
            start_date: "2023-09-05T08:30:00Z",
            end_date: "2024-03-05T08:30:00Z",
            last_updated: "2024-03-06T00:00:00Z"
        }
    ];

    useEffect(() => {
        // Only fetch data after we've confirmed admin status
        if (!isLoading && isAdmin) {
            const fetchSubscriptions = async () => {
                try {
                    // In a real implementation, fetch from an API
                    // const response = await fetch('/api/admin/subscriptions');
                    // const data = await response.json();
                    // setSubscriptions(data);

                    // For now, use sample data
                    setSubscriptions(sampleSubscriptions);
                    setFilteredSubscriptions(sampleSubscriptions);
                } catch (error) {
                    console.error("Error fetching subscriptions:", error);
                } finally {
                    setFetchingData(false);
                }
            };

            void fetchSubscriptions();
        }
    }, [isLoading, isAdmin]);

    // Apply filters when they change
    useEffect(() => {
        let result = [...subscriptions];

        // Apply status filter
        if (statusFilter !== "all") {
            result = result.filter(sub => sub.status === statusFilter);
        }

        // Apply plan filter
        if (planFilter !== "all") {
            result = result.filter(sub => sub.plan_type === planFilter);
        }

        // Apply search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(sub =>
                sub.user_name?.toLowerCase().includes(query) ||
                sub.user_email?.toLowerCase().includes(query) ||
                sub.user_id.toLowerCase().includes(query)
            );
        }

        setFilteredSubscriptions(result);
    }, [statusFilter, planFilter, searchQuery, subscriptions]);

    // Show loading while checking auth or fetching data
    if (isLoading || fetchingData) {
        return <LoadingSkeleton />;
    }

    // Safety check - don't render for non-admins
    if (!isAdmin) {
        return null;
    }

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString();
    };

    // Badge for subscription status
    const getStatusBadge = (status: Subscription['status']) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-500/20 text-green-500">Active</Badge>;
            case 'cancelled':
                return <Badge className="bg-amber-500/20 text-amber-500">Cancelled</Badge>;
            case 'expired':
                return <Badge className="bg-gray-500/20 text-gray-400">Expired</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    // Badge for plan type
    const getPlanBadge = (plan: Subscription['plan_type']) => {
        switch (plan) {
            case 'free':
                return <Badge className="bg-gray-500/20 text-gray-400">Free</Badge>;
            case 'basic':
                return <Badge className="bg-blue-500/20 text-blue-500">Basic</Badge>;
            case 'pro':
                return <Badge className="bg-purple-500/20 text-purple-500">Pro</Badge>;
            default:
                return <Badge>{plan}</Badge>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Subscription Management</h1>
                <p className="text-gray-400 mt-1">
                    View and manage user subscriptions and payment details
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="bg-blue-600/20 p-3 rounded-full">
                                <Database className="h-6 w-6 text-blue-500" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold">
                                    {filteredSubscriptions.filter(s => s.status === 'active').length}
                                </p>
                                <p className="text-sm text-gray-400">Active Subscriptions</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="bg-purple-600/20 p-3 rounded-full">
                                <User className="h-6 w-6 text-purple-500" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold">
                                    {filteredSubscriptions.filter(s => s.plan_type === 'pro').length}
                                </p>
                                <p className="text-sm text-gray-400">Pro Users</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="bg-green-600/20 p-3 rounded-full">
                                <Calendar className="h-6 w-6 text-green-500" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold">
                                    {formatCurrency(
                                        filteredSubscriptions
                                            .filter(s => s.status === 'active')
                                            .reduce((total, sub) => total + sub.price, 0)
                                    )}
                                </p>
                                <p className="text-sm text-gray-400">Monthly Revenue</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card className="bg-[#1b2539] border-0 mb-6">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full md:w-1/3">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-400 mb-1">
                                Search Users
                            </label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    id="search"
                                    placeholder="Search by name, email or ID"
                                    className="pl-8 bg-[#0f1729] border-[#232b3c]"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-1/4">
                            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-400 mb-1">
                                Status
                            </label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger id="status-filter" className="bg-[#0f1729] border-[#232b3c]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full md:w-1/4">
                            <label htmlFor="plan-filter" className="block text-sm font-medium text-gray-400 mb-1">
                                Plan Type
                            </label>
                            <Select value={planFilter} onValueChange={setPlanFilter}>
                                <SelectTrigger id="plan-filter" className="bg-[#0f1729] border-[#232b3c]">
                                    <SelectValue placeholder="Filter by plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Plans</SelectItem>
                                    <SelectItem value="free">Free</SelectItem>
                                    <SelectItem value="basic">Basic</SelectItem>
                                    <SelectItem value="pro">Pro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button variant="outline" onClick={() => {
                            setStatusFilter("all");
                            setPlanFilter("all");
                            setSearchQuery("");
                        }} className="border-[#232b3c] text-gray-300">
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Reset
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Subscriptions Table */}
            <Card className="bg-[#1b2539] border-0">
                <CardHeader className="pb-0">
                    <CardTitle>Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-[#232b3c]">
                                <TableHead>User</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>Renewal Date</TableHead>
                                <TableHead>Payment Method</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSubscriptions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                                        No subscriptions found matching your filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSubscriptions.map((subscription) => (
                                    <TableRow key={subscription.id} className="border-b border-[#232b3c]">
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{subscription.user_name}</div>
                                                <div className="text-sm text-gray-400">{subscription.user_email}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getPlanBadge(subscription.plan_type)}</TableCell>
                                        <TableCell>{formatCurrency(subscription.price)}</TableCell>
                                        <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                                        <TableCell>{formatDate(subscription.start_date)}</TableCell>
                                        <TableCell>{formatDate(subscription.end_date)}</TableCell>
                                        <TableCell>
                                            {subscription.payment_method ? (
                                                <div className="capitalize">{subscription.payment_method}</div>
                                            ) : (
                                                <span className="text-gray-400">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 border-[#232b3c] text-gray-300"
                                                    onClick={() => {
                                                        // In a real app, you would navigate to edit page or open a modal
                                                        alert(`Edit subscription ${subscription.id}`);
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                                <Link href={`/admin/users/${subscription.user_id}`}>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 border-[#232b3c] text-gray-300"
                                                    >
                                                        View User
                                                    </Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}