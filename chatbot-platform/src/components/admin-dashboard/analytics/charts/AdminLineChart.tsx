'use client';

import React from "react";
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";

export interface AdminLineChartData {
    date: string;
    count: number;
}

interface AdminLineChartProps {
    data: AdminLineChartData[];
    xDataKey?: string;
    yDataKey?: string;
    primaryColor?: string;
}

const AdminLineChart: React.FC<AdminLineChartProps> = ({
                                                           data,
                                                           xDataKey = "date",
                                                           yDataKey = "count",
                                                           primaryColor = "#3b82f6",
                                                       }) => {
    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey={xDataKey} stroke="#cbd5e1" />
                    <YAxis stroke="#cbd5e1" />
                    <Tooltip
                        contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155" }}
                        labelStyle={{ color: "#fff" }}
                        cursor={{ stroke: "#94a3b8", strokeWidth: 1 }}
                    />
                    <Line
                        type="monotone"
                        dataKey={yDataKey}
                        stroke={primaryColor}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AdminLineChart;
