// src/components/dashboard/TopCustomers.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function TopCustomers() {
    // Mock data for the table
    const customers = [
        { id: 1, name: "John Doe", amount: 1200.00, country: "USA", date: "2023-10-15", status: "active" },
        { id: 2, name: "Jane Smith", amount: 850.50, country: "Canada", date: "2023-10-14", status: "pending" },
        { id: 3, name: "Michael Johnson", amount: 500.00, country: "UK", date: "2023-10-13", status: "inactive" },
        { id: 4, name: "Emily Brown", amount: 650.75, country: "Australia", date: "2023-10-12", status: "active" },
        { id: 5, name: "David Wilson", amount: 300.20, country: "Germany", date: "2023-10-11", status: "active" },
        { id: 6, name: "Sarah White", amount: 1100.30, country: "Netherlands", date: "2023-10-10", status: "pending" },
        { id: 7, name: "Kevin Lee", amount: 400.00, country: "France", date: "2023-10-09", status: "inactive" },
    ];

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Render status badge
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <div className="flex items-center">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1" />
                        <span>Active</span>
                    </div>
                );
            case 'pending':
                return (
                    <div className="flex items-center">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 mr-1" />
                        <span>Pending</span>
                    </div>
                );
            case 'inactive':
                return (
                    <div className="flex items-center">
                        <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mr-1" />
                        <span>Inactive</span>
                    </div>
                );
            default:
                return <span>{status}</span>;
        }
    };

    return (
        <Card className="bg-[#1b2539] text-white border-0">
            <CardHeader className="p-4 sm:p-6">
                <CardTitle>Top Customers</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left py-2 px-3 sm:py-3 sm:px-4 font-medium text-gray-400 text-xs sm:text-sm">User</th>
                                <th className="text-left py-2 px-3 sm:py-3 sm:px-4 font-medium text-gray-400 text-xs sm:text-sm">Total Amount</th>
                                <th className="text-left py-2 px-3 sm:py-3 sm:px-4 font-medium text-gray-400 text-xs sm:text-sm">Country</th>
                                <th className="text-left py-2 px-3 sm:py-3 sm:px-4 font-medium text-gray-400 text-xs sm:text-sm">Date</th>
                                <th className="text-left py-2 px-3 sm:py-3 sm:px-4 font-medium text-gray-400 text-xs sm:text-sm">Status</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                            {customers.map((customer) => (
                                <tr key={customer.id} className="border-b border-gray-700 hover:bg-[#232b3c]">
                                    <td className="py-2 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm">{customer.name}</td>
                                    <td className="py-2 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm">${formatCurrency(customer.amount)}</td>
                                    <td className="py-2 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm">{customer.country}</td>
                                    <td className="py-2 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm">{formatDate(customer.date)}</td>
                                    <td className="py-2 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm">
                                        <div className="inline-flex items-center">
                                            {renderStatusBadge(customer.status)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}