// chatbot-platform/src/components/chatbots/ChatbotEditClient.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Chatbot, Industry } from '@/lib/db/schema';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ChatbotEditClient({ id }: { id: string }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [chatbot, setChatbot] = useState<Chatbot | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        industry: 'general' as Industry,
        apiUrl: '',
        platform: '',
        apiKey: '',
        customPrompt: '',
    });

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
                setFormData({
                    name: data.name,
                    industry: data.industry,
                    apiUrl: data.apiUrl,
                    platform: data.platform,
                    apiKey: data.apiKey || '',
                    customPrompt: data.customPrompt || '',
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
            // Update the chatbot details in Postgres
            const response = await fetch(`/api/chatbots/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    // Keep the uneditable fields unchanged
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update chatbot');
            }

            // Now update the custom prompt in AstraDB via the storage endpoint.
            const storageResponse = await fetch(`http://localhost:3001/api/storage`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    storeName: formData.name,      // Assuming "name" is used to identify the store in AstraDB
                    customPrompt: formData.customPrompt,
                }),
            });

            if (!storageResponse.ok) {
                const storageError = await storageResponse.json();
                throw new Error(storageError.message || 'Failed to update system prompt in AstraDB');
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
                        <Link href="/dashboard/chatbots" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            Back to Chatbots
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Edit Chatbot: {chatbot.name}</h1>
            <p className="mb-4 text-sm text-gray-600">
                Note: Only the Chatbot Name and Custom Prompt can be edited. To change fields like API URL, platform, or API key, please create a new chatbot.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Chatbot Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-2 border rounded-md text-black"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Custom Prompt (Optional)</label>
                            <textarea
                                value={formData.customPrompt}
                                onChange={(e) => setFormData({ ...formData, customPrompt: e.target.value })}
                                className="w-full p-2 border rounded-md text-black"
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>
                <div className="flex justify-end">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
