// src/components/admin-dashboard/users/RoleFilter.tsx
import React from "react";
import { Filter } from "lucide-react";

interface RoleFilterProps {
    value: string;
    onChange: (value: string) => void;
}

export default function RoleFilter({ value, onChange }: RoleFilterProps) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full sm:w-32 appearance-none pl-10 pr-4 py-2 bg-[#1b2539] border border-gray-700 rounded-md text-white"
            >
                <option value="all">All</option>
                <option value="admin">Admin</option>
                <option value="client">Client</option>
            </select>
            <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
    );
}
