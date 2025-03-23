// src/components/analytics/FeedbackSummary.tsx
"use client";

import { FeedbackSummary } from '@/lib/analytics/types';
import { Star } from 'lucide-react';

interface FeedbackSummaryComponentProps {
    data?: FeedbackSummary | null;
}

export default function FeedbackSummaryComponent({ data }: FeedbackSummaryComponentProps) {
    // Check if feedback data exists
    if (!data) {
        return (
            <div className="text-center py-6">
                <p className="text-gray-500">No feedback data available.</p>
            </div>
        );
    }

    // Ensure totalFeedback exists and is a number
    const totalFeedback = typeof data.totalFeedback === 'number' ? data.totalFeedback : 0;

    // If no feedback, show a message
    if (totalFeedback === 0) {
        return (
            <div className="text-center py-6">
                <p className="text-gray-500">No feedback received for this period.</p>
            </div>
        );
    }

    // Ensure averageRating is a number and handle null/undefined cases
    const averageRating = typeof data.averageRating === 'number'
        ? data.averageRating
        : 0;

    // Ensure ratingDistribution exists
    const ratingDistribution = data.ratingDistribution || {};

    // Calculate the percentage for each rating
    const ratingPercentages = {
        '1': (ratingDistribution['1'] || 0) / totalFeedback * 100 || 0,
        '2': (ratingDistribution['2'] || 0) / totalFeedback * 100 || 0,
        '3': (ratingDistribution['3'] || 0) / totalFeedback * 100 || 0,
        '4': (ratingDistribution['4'] || 0) / totalFeedback * 100 || 0,
        '5': (ratingDistribution['5'] || 0) / totalFeedback * 100 || 0,
    } as Record<string, number>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-400">Average Rating</p>
                    <div className="flex items-center mt-1">
                        <p className="text-3xl font-semibold mr-2">{averageRating.toFixed(1)}</p>
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-5 h-5 ${
                                        star <= Math.round(averageRating)
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-gray-300'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                        Based on {totalFeedback} {totalFeedback === 1 ? 'rating' : 'ratings'}
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center">
                        <div className="flex items-center w-16">
                            <span className="text-sm font-medium mr-1">{rating}</span>
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        </div>
                        <div className="relative flex-1 h-4 bg-gray-700 rounded-full">
                            <div
                                className="absolute top-0 left-0 h-4 bg-yellow-400 rounded-full"
                                style={{ width: `${ratingPercentages[rating.toString()]}%` }}
                            ></div>
                        </div>
                        <div className="w-16 text-right">
                            <span className="text-sm text-gray-400">
                                {ratingDistribution[rating.toString()] || 0} ({Math.round(ratingPercentages[rating.toString()])}%)
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Recent Feedback</h3>
                {data.recentFeedback && data.recentFeedback.length > 0 ? (
                    <div className="space-y-4">
                        {data.recentFeedback.map((item) => (
                            <div key={item.id} className="p-4 border border-gray-700 rounded-lg bg-[#232b3c]">
                                <div className="flex justify-between mb-2">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-4 h-4 ${
                                                    star <= item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-400">
                                        {new Date(item.submittedAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>

                                <div className="mb-2 p-2 bg-gray-800 rounded text-sm">
                                    <p className="font-medium text-xs text-gray-400 mb-1">User asked:</p>
                                    <p>{item.messageText}</p>
                                </div>

                                <div className="mb-2 p-2 bg-blue-900/30 rounded text-sm">
                                    <p className="font-medium text-xs text-gray-400 mb-1">Chatbot responded:</p>
                                    <p>{item.responseText}</p>
                                </div>

                                {item.feedbackText && (
                                    <div className="mt-2">
                                        <p className="font-medium text-xs text-gray-400 mb-1">User comment:</p>
                                        <p className="text-sm italic">{item.feedbackText}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">No detailed feedback available.</p>
                )}
            </div>
        </div>
    );
}