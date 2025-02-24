"use client";

import { useState } from 'react';
import { Industry } from '@/lib/chatbots/types';

interface ChatbotFormProps {
    onSubmit: (data: {
        name: string;
        description: string;
        industry: Industry;
    }) => void;
}

export default function ChatbotForm({ onSubmit }: ChatbotFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        industry: 'general' as Industry,
    });

    const industries: Industry[] = ['fashion', 'electronics', 'general', 'food', 'beauty'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Chatbot Name
                </label>
                <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border rounded-md bg-background text-foreground"
                    required
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                    Description
                </label>
                <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2 border rounded-md bg-background text-foreground"
                    rows={3}
                />
            </div>

            <div>
                <label htmlFor="industry" className="block text-sm font-medium text-foreground mb-2">
                    Industry
                </label>
                <select
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value as Industry })}
                    className="w-full p-2 border rounded-md bg-background text-foreground"
                >
                    {industries.map((industry) => (
                        <option key={industry} value={industry}>
                            {industry.charAt(0).toUpperCase() + industry.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            <button
                type="submit"
                className="w-full bg-foreground text-background py-2 rounded-md hover:bg-opacity-90"
            >
                Create Chatbot
            </button>
        </form>
    );
}