// src/components/admin-dashboard/chatbots/ChatbotSearchFilter.tsx
import { Search, Filter } from "lucide-react";

interface ChatbotSearchFilterProps {
    search: string;
    setSearch: (value: string) => void;
    filter: string;
    setFilter: (value: string) => void;
}

export default function ChatbotSearchFilter({ search, setSearch, filter, setFilter }: ChatbotSearchFilterProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search chatbots..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-2 bg-[#1b2539] border border-gray-700 rounded-md text-white"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <div className="relative">
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full sm:w-32 appearance-none pl-10 pr-4 py-2 bg-[#1b2539] border border-gray-700 rounded-md text-white"
                >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="error">Error</option>
                </select>
                <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
        </div>
    );
}