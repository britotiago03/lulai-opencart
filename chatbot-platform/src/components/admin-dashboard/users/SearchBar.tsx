// src/components/admin-dashboard/users/SearchBar.tsx
import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
    return (
        <div className="relative">
            <input
                type="text"
                placeholder="Search users..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 bg-[#1b2539] border border-gray-700 rounded-md text-white"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
    );
}