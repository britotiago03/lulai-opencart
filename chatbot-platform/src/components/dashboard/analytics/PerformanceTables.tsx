"use client";
import { Card, CardContent } from "@/components/ui/card";
import { ChatbotStat } from "@/types/analytics";
import React from "react";

export function AdminTopChatbots({ list }: { list: ChatbotStat[] }) {
    if (!list?.length) return null;
    return (
        <Card className="bg-[#1b2539] border-0 mb-6">
            <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4">Top Performing Chatbots</h3>
                <Table
                    headers={["Name", "Users", "Conversions", "Rate"]}
                    rows={list.map((b) => [
                        b.name,
                        b.totalUsers,
                        b.conversions,
                        <Badge
                            key={`badge-${b.name}`}
                            value={`${b.conversionRate}%`}
                            good={b.conversionRate > 10}
                        />,
                    ])}
                />
            </CardContent>
        </Card>
    );
}

export function ClientChatbotStats({ list }: { list: ChatbotStat[] }) {
    if (!list?.length) return null;
    return (
        <Card className="bg-[#1b2539] border-0">
            <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4">Your Chatbot Performance</h3>
                <Table
                    headers={["Name", "Conversations", "Messages", "Conversions", "Rate"]}
                    rows={list.map((b) => [
                        b.name,
                        b.totalConversations,
                        b.totalMessages,
                        b.conversions,
                        <Badge
                            key={`client-badge-${b.name}`}
                            value={`${b.conversionRate.toFixed(1)}%`}
                            good={b.conversionRate > 10}
                        />,
                    ])}
                />
            </CardContent>
        </Card>
    );
}

/* ---------- tiny shared helpers ---------- */
function Table({
                   headers,
                   rows,
               }: {
    headers: string[];
    rows: (string | number | React.ReactNode)[][];
}) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                <tr className="border-b border-gray-700">
                    {headers.map((h) => (
                        <th key={h} className="py-2 px-3 text-left">
                            {h}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {rows.map((row, idx) => (
                    <tr
                        key={`row-${idx}`}
                        className="border-b border-gray-800 hover:bg-[#232b3c]"
                    >
                        {row.map((cell, i) => (
                            <td key={`cell-${idx}-${i}`} className="py-2 px-3">
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

function Badge({ value, good }: { value: string; good: boolean }) {
    return (
        <span
            className={`px-2 py-1 rounded-full text-xs ${
                good
                    ? "bg-green-900/30 text-green-400"
                    : "bg-blue-900/30 text-blue-400"
            }`}
        >
            {value}
        </span>
    );
}
