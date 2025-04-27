import { Search } from "lucide-react";

export default function AgentSearchBar({
                                           value,
                                           onChange,
                                       }: {
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="relative w-full sm:w-64">
            <input
                type="text"
                placeholder="Search agents..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#1b2539] border border-gray-700 rounded-md text-white w-full"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
    );
}
