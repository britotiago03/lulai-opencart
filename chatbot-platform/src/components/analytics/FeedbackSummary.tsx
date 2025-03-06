// src/components/analytics/FeedbackSummary.tsx
"use client";

import { FeedbackSummary } from '@/lib/analytics/types';
import { Star } from 'lucide-react';

interface FeedbackSummaryComponentProps {
    feedback: FeedbackSummary;
}

export default function FeedbackSummaryComponent({ feedback }: FeedbackSummaryComponentProps) {
    // If no feedback, show a message
    if (feedback.totalFeedback === 0) {
        return (
            <div className="text-center py-6">
                <p className="text-gray-500">No feedback received for this period.</p>
            </div>
        );
    }

    // Ensure averageRating is a number and handle null/undefined cases
    const averageRating = typeof feedback.averageRating === 'number'
        ? feedback.averageRating
        : 0;

    // Calculate the percentage for each rating
    const ratingPercentages = {
        '1': (feedback.ratingDistribution['1'] / feedback.totalFeedback) * 100 || 0,
        '2': (feedback.ratingDistribution['2'] / feedback.totalFeedback) * 100 || 0,
        '3': (feedback.ratingDistribution['3'] / feedback.totalFeedback) * 100 || 0,
        '4': (feedback.ratingDistribution['4'] / feedback.totalFeedback) * 100 || 0,
        '5': (feedback.ratingDistribution['5'] / feedback.totalFeedback) * 100 || 0,
    } as Record<string, number>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">Average Rating</p>
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
                    <p className="text-sm text-gray-500 mt-1">
                        Based on {feedback.totalFeedback} {feedback.totalFeedback === 1 ? 'rating' : 'ratings'}
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
                        <div className="relative flex-1 h-4 bg-gray-100 rounded-full">
                            <div
                                className="absolute top-0 left-0 h-4 bg-yellow-400 rounded-full"
                                style={{ width: `${ratingPercentages[rating.toString()]}%` }}
                            ></div>
                        </div>
                        <div className="w-16 text-right">
                            <span className="text-sm text-gray-500">
                                {feedback.ratingDistribution[rating.toString()] || 0} ({Math.round(ratingPercentages[rating.toString()])}%)
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Recent Feedback</h3>
                {feedback.recentFeedback.length > 0 ? (
                    <div className="space-y-4">
                        {feedback.recentFeedback.map((item) => (
                            <div key={item.id} className="p-4 border rounded-lg">
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
                                    <span className="text-sm text-gray-500">
                                        {new Date(item.submittedAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>

                                <div className="mb-2 p-2 bg-gray-50 rounded text-sm">
                                    <p className="font-medium text-xs text-gray-500 mb-1">User asked:</p>
                                    <p>{item.messageText}</p>
                                </div>

                                <div className="mb-2 p-2 bg-blue-50 rounded text-sm">
                                    <p className="font-medium text-xs text-gray-500 mb-1">Chatbot responded:</p>
                                    <p>{item.responseText}</p>
                                </div>

                                {item.feedbackText && (
                                    <div className="mt-2">
                                        <p className="font-medium text-xs text-gray-500 mb-1">User comment:</p>
                                        <p className="text-sm italic">{item.feedbackText}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No detailed feedback available.</p>
                )}
            </div>
        </div>
    );
}