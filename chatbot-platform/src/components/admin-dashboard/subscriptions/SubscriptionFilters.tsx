// src/components/subscriptions/SubscriptionFilters.tsx
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, RefreshCcw } from "lucide-react";
import { useState, useTransition } from "react";

// Define the props that this component expects
interface SubscriptionFiltersProps {
    // Initial values
    initialStatusFilter: string;
    initialPlanFilter: string;
    initialSearchQuery: string;
    // Server actions
    updateFiltersAction: (status: string, plan: string, search: string) => Promise<void>;
}

export default function SubscriptionFilters({
                                                initialStatusFilter = "all",
                                                initialPlanFilter = "all",
                                                initialSearchQuery = "",
                                                updateFiltersAction
                                            }: SubscriptionFiltersProps) {
    // Local state for controlled inputs
    const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
    const [planFilter, setPlanFilter] = useState(initialPlanFilter);
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [isPending, startTransition] = useTransition();

    // Update handlers that call the server action
    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        startTransition(() => {
            void updateFiltersAction(value, planFilter, searchQuery);
        });
    };

    const handlePlanChange = (value: string) => {
        setPlanFilter(value);
        startTransition(() => {
            void updateFiltersAction(statusFilter, value, searchQuery);
        });
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        // Debounce search to avoid too many server actions
        const timeoutId = setTimeout(() => {
            startTransition(() => {
                void updateFiltersAction(statusFilter, planFilter, value);
            });
        }, 300);

        return () => clearTimeout(timeoutId);
    };

    // Reset handler
    const handleReset = () => {
        setStatusFilter("all");
        setPlanFilter("all");
        setSearchQuery("");
        startTransition(() => {
            void updateFiltersAction("all", "all", "");
        });
    };

    return (
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
                                onChange={(e) => handleSearchChange(e.target.value)}
                                disabled={isPending}
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-1/4">
                        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-400 mb-1">
                            Status
                        </label>
                        <Select
                            value={statusFilter}
                            onValueChange={handleStatusChange}
                            disabled={isPending}
                        >
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
                        <Select
                            value={planFilter}
                            onValueChange={handlePlanChange}
                            disabled={isPending}
                        >
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

                    <Button
                        variant="outline"
                        onClick={handleReset}
                        className="border-[#232b3c] text-gray-300"
                        disabled={isPending}
                    >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Reset
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}