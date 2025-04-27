import { Search } from "lucide-react";

export default function SearchBar({ search, onChange }: { search: string; onChange: (val: string) => void }) {
    return (
        <div className="relative w-full md:w-64">
            <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#1b2539] border border-gray-700 rounded-md text-white"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
    );
}
