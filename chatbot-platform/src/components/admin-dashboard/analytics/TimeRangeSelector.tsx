// src/components/admin-dashboard/analytics/TimeRangeSelector.tsx
import React from "react";

interface TimeRangeSelectorProps {
    currentTimeRange: string;
    onTimeRangeChange: (range: string) => void;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
                                                                        currentTimeRange,
                                                                        onTimeRangeChange,
                                                                    }) => {
    return (
        <div className="flex bg-[#1b2539] rounded-md">
            <button
                onClick={() => onTimeRangeChange("7")}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                    currentTimeRange === "7" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                }`}
            >
                7 Days
            </button>
            <button
                onClick={() => onTimeRangeChange("30")}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                    currentTimeRange === "30" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                }`}
            >
                30 Days
            </button>
            <button
                onClick={() => onTimeRangeChange("90")}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                    currentTimeRange === "90" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                }`}
            >
                90 Days
            </button>
        </div>
    );
};