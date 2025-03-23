// src/components/analytics/FilterBar.tsx
"use client";

import { useState } from 'react';
import { Calendar } from 'lucide-react';

interface FilterBarProps {
    startDate: string;
    endDate: string;
    onDateRangeChange: (startDate: string, endDate: string) => void;
}

export default function FilterBar({
                                      startDate,
                                      endDate,
                                      onDateRangeChange
                                  }: FilterBarProps) {
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
    const [customStartDate, setCustomStartDate] = useState(startDate);
    const [customEndDate, setCustomEndDate] = useState(endDate);

    // Handle preset period selection
    const handlePresetChange = (preset: string) => {
        const today = new Date();
        let newStartDate: Date;

        switch (preset) {
            case '7d':
                newStartDate = new Date(today);
                newStartDate.setDate(today.getDate() - 7);
                break;
            case '30d':
                newStartDate = new Date(today);
                newStartDate.setDate(today.getDate() - 30);
                break;
            case '90d':
                newStartDate = new Date(today);
                newStartDate.setDate(today.getDate() - 90);
                break;
            case 'year':
                newStartDate = new Date(today);
                newStartDate.setDate(today.getDate() - 365);
                break;
            default:
                return;
        }

        const formattedStartDate = newStartDate.toISOString().split('T')[0];
        const formattedEndDate = today.toISOString().split('T')[0];

        onDateRangeChange(formattedStartDate, formattedEndDate);
        setCustomStartDate(formattedStartDate);
        setCustomEndDate(formattedEndDate);
        setShowCustomDatePicker(false);
    };

    // Apply custom date range
    const applyCustomDateRange = () => {
        onDateRangeChange(customStartDate, customEndDate);
        setShowCustomDatePicker(false);
    };

    // Format dates for display
    const formatDateForDisplay = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date range:</p>
                    <div className="relative">
                        <button
                            onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
                            className="flex items-center space-x-2 border rounded-md px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <Calendar className="w-4 h-4" />
                            <span>
                {formatDateForDisplay(startDate)} - {formatDateForDisplay(endDate)}
              </span>
                        </button>

                        {showCustomDatePicker && (
                            <div className="absolute top-full left-0 mt-2 p-4 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-10 w-80">
                                <div className="space-y-4">
                                    <div className="flex flex-col space-y-1">
                                        <label htmlFor="startDate" className="text-sm font-medium">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            id="startDate"
                                            value={customStartDate}
                                            onChange={(e) => setCustomStartDate(e.target.value)}
                                            className="border rounded-md px-3 py-1.5 text-sm"
                                            max={customEndDate}
                                        />
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                        <label htmlFor="endDate" className="text-sm font-medium">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            id="endDate"
                                            value={customEndDate}
                                            onChange={(e) => setCustomEndDate(e.target.value)}
                                            className="border rounded-md px-3 py-1.5 text-sm"
                                            min={customStartDate}
                                            max={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => setShowCustomDatePicker(false)}
                                            className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={applyCustomDateRange}
                                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex space-x-1">
                    <button
                        onClick={() => handlePresetChange('7d')}
                        className={`px-3 py-1.5 text-sm rounded-md ${
                            startDate === new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                                ? 'bg-blue-600 text-white'
                                : 'border hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                        Last 7 days
                    </button>
                    <button
                        onClick={() => handlePresetChange('30d')}
                        className={`px-3 py-1.5 text-sm rounded-md ${
                            startDate === new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                                ? 'bg-blue-600 text-white'
                                : 'border hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                        Last 30 days
                    </button>
                    <button
                        onClick={() => handlePresetChange('90d')}
                        className={`px-3 py-1.5 text-sm rounded-md ${
                            startDate === new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                                ? 'bg-blue-600 text-white'
                                : 'border hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                        Last 90 days
                    </button>
                </div>
            </div>
        </div>
    );
}