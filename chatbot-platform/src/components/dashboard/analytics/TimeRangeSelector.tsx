"use client";
import { RefreshCw } from "lucide-react";

export default function TimeRangeSelector({
                                              value,
                                              onChangeAction,      // renamed
                                              onRefreshAction      // renamed
                                          }: {
    value: "7" | "30" | "90";
    onChangeAction: (v: "7" | "30" | "90") => void;
    onRefreshAction: () => void;
}) {
    const btn = (range: "7" | "30" | "90", label: string) => (
        <button
            onClick={() => onChangeAction(range)}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
                value === range ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="flex space-x-4 items-center">
            <div className="flex bg-[#1b2539] rounded-md">
                {btn("7", "7 Days")}
                {btn("30", "30 Days")}
                {btn("90", "90 Days")}
            </div>
            <button
                onClick={onRefreshAction}
                className="p-2 bg-[#1b2539] text-gray-400 hover:text-white rounded-md transition-colors"
                title="Refresh data"
            >
                <RefreshCw className="h-5 w-5" />
            </button>
        </div>
    );
}