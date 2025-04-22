'use client';

import React from "react";
import {
    PieChart,
    Pie,
    Tooltip,
    Cell,
    ResponsiveContainer
} from "recharts";

export interface AdminPieChartData {
    name: string;
    value: number;
}

interface AdminPieChartProps {
    data: AdminPieChartData[];
    dataKey?: string;
    nameKey?: string;
    colors?: string[];
}

const AdminPieChart: React.FC<AdminPieChartProps> = ({
                                                         data,
                                                         dataKey = "value",
                                                         nameKey = "name",
                                                         colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'],
                                                     }) => {
    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Tooltip
                        contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155" }}
                        labelStyle={{ color: "#fff" }}
                        cursor={{ fill: "#33415533" }}
                    />
                    <Pie
                        data={data}
                        dataKey={dataKey}
                        nameKey={nameKey}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AdminPieChart;
