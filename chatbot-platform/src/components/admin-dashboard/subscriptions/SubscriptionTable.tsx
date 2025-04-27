// src/components/subscriptions/SubscriptionTable.tsx
"use client";

import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, PlanBadge } from "./SubscriptionBadges";
import { AdminSubscription, formatDate, formatCurrency } from "@/types/subscription";

interface SubscriptionTableProps {
    subscriptions: AdminSubscription[];
}

export default function SubscriptionTable({ subscriptions }: SubscriptionTableProps) {
    return (
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
                        {subscriptions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                                    No subscriptions found matching your filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            subscriptions.map((subscription) => (
                                <SubscriptionRow
                                    key={subscription.id}
                                    subscription={subscription}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

// Separate component for each row to improve readability
function SubscriptionRow({ subscription }: { subscription: AdminSubscription }) {
    return (
        <TableRow className="border-b border-[#232b3c]">
            <TableCell>
                <div>
                    <div className="font-medium">{subscription.user_name}</div>
                    <div className="text-sm text-gray-400">{subscription.user_email}</div>
                </div>
            </TableCell>
            <TableCell><PlanBadge plan={subscription.plan_type} /></TableCell>
            <TableCell>{formatCurrency(subscription.price)}</TableCell>
            <TableCell><StatusBadge status={subscription.status} /></TableCell>
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
    );
}