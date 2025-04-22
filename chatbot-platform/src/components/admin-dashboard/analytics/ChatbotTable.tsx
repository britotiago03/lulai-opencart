// src/components/admin-dashboard/analytics/ChatbotTable.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

// Type definitions
interface PerformanceBot {
    name: string;
    total_users: number;
    conversions: number;
    conversion_rate: string;
}

interface ActivityBot {
    name: string;
    user_count: number;
    message_count: number;
    api_key: string;
}

// Union prop interface with type discrimination
type ChatbotTableProps =
    | {
    data: PerformanceBot[];
    title: string;
    columns: string[];
    type: "performance";
}
    | {
    data: ActivityBot[];
    title: string;
    columns: string[];
    type: "activity";
};

export const ChatbotTable: React.FC<ChatbotTableProps> = ({
                                                              data,
                                                              title,
                                                              columns,
                                                              type,
                                                          }) => {
    return (
        <Card className="bg-[#1b2539] border-0 mb-6">
            <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-700">
                            {columns.map((column: string, index: number) => (
                                <th key={index} className="py-2 px-3 text-left">
                                    {column}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {data.map(
                            (
                                bot: PerformanceBot | ActivityBot,
                                index: number
                            ) => (
                                <tr
                                    key={index}
                                    className="border-b border-gray-800 hover:bg-[#232b3c]"
                                >
                                    <td className="py-2 px-3">{bot.name}</td>
                                    <td className="py-2 px-3">
                                        {type === "performance"
                                            ? (bot as PerformanceBot).total_users
                                            : (bot as ActivityBot).user_count}
                                    </td>
                                    <td className="py-2 px-3">
                                        {type === "performance"
                                            ? (bot as PerformanceBot).conversions
                                            : (bot as ActivityBot).message_count}
                                    </td>
                                    <td className="py-2 px-3">
                                        {type === "performance" ? (
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs ${
                                                    parseFloat(
                                                        (bot as PerformanceBot)
                                                            .conversion_rate
                                                    ) > 10
                                                        ? "bg-green-900/30 text-green-400"
                                                        : "bg-blue-900/30 text-blue-400"
                                                }`}
                                            >
                                                    {
                                                        (bot as PerformanceBot)
                                                            .conversion_rate
                                                    }
                                                %
                                                </span>
                                        ) : (
                                            <a
                                                href={`/admin/chatbots?api_key=${
                                                    (bot as ActivityBot).api_key
                                                }`}
                                                className="text-blue-500 hover:text-blue-400"
                                            >
                                                View
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            )
                        )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};
