// src/components/chatbots/ChatbotEditClient.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Chatbot, Industry, ChatbotResponse } from '@/lib/db/schema';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ResponseEditor from '@/components/chatbots/ResponseEditor';

export default function ChatbotEditClient({ id }: { id: string }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [chatbot, setChatbot] = useState<Chatbot | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        industry: 'general' as Industry,
        responses: [] as ChatbotResponse[]
    });

    // Fetch chatbot data
    useEffect(() => {
        const fetchChatbot = async () => {
            try {
                const response = await fetch(`/api/chatbots/${id}`);
                if (response.status === 404) {
                    setError('Chatbot not found');
                    return;
                }
                if (!response.ok) {
                    throw new Error('Failed to fetch chatbot details');
                }
                const data = await response.json();
                setChatbot(data);

                // Set form data
                setFormData({
                    name: data.name,
                    description: data.description || '',
                    industry: data.industry,
                    responses: data.responses || []
                });
            } catch (error) {
                setError('Error loading chatbot details');
                console.error('Error fetching chatbot:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChatbot();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/chatbots/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update chatbot');
            }

            alert('Chatbot updated successfully!');
            router.push(`/dashboard/chatbots/${id}`);
        } catch (error) {
            console.error('Error updating chatbot:', error);
            alert(`Failed to update chatbot: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this chatbot? This cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/chatbots/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete chatbot');
            }

            alert('Chatbot deleted successfully!');
            router.push('/dashboard/chatbots');
        } catch (error) {
            console.error('Error deleting chatbot:', error);
            alert(`Failed to delete chatbot: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleResponsesChange = (responses: ChatbotResponse[]) => {
        setFormData(prev => ({ ...prev, responses }));
    };

    const industries: Industry[] = ['fashion', 'electronics', 'general', 'food', 'beauty'];

    if (loading) {
        return <div className="text-center py-8">Loading chatbot details...</div>;
    }

    if (error || !chatbot) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-500 mb-4">{error || 'Could not load chatbot'}</p>
                        <Link
                            href="/dashboard/chatbots"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Back to Chatbots
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Edit Chatbot: {chatbot.name}</h1>
                <div className="flex gap-2">
                    <Link
                        href={`/dashboard/chatbots/${id}`}
                        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        Delete Chatbot
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-2">
                                Chatbot Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-2 border rounded-md"
                                rows={3}
                            />
                        </div>

                        <div>
                            <label htmlFor="industry" className="block text-sm font-medium mb-2">
                                Industry
                            </label>
                            <select
                                id="industry"
                                value={formData.industry}
                                onChange={(e) => setFormData({ ...formData, industry: e.target.value as Industry })}
                                className="w-full p-2 border rounded-md"
                            >
                                {industries.map((industry) => (
                                    <option key={industry} value={industry}>
                                        {industry.charAt(0).toUpperCase() + industry.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Chatbot Responses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponseEditor
                            responses={formData.responses}
                            onChange={handleResponsesChange}
                            industry={formData.industry}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}