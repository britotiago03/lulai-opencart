// src/components/chatbots/ResponseEditor.tsx
"use client";

import { useState } from 'react';
import { ChatbotResponse } from '@/lib/db/schema';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ResponseEditorProps {
    responses: ChatbotResponse[];
    onChange: (responses: ChatbotResponse[]) => void;
    industry: string; // Add this prop
}

export default function ResponseEditor({ responses, onChange, industry }: ResponseEditorProps) {
    const [newTrigger, setNewTrigger] = useState('');
    const [newResponse, setNewResponse] = useState('');
    const [isAI, setIsAI] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);

    const handleAddResponse = async () => {
        if (!newTrigger || !newResponse) return;

        let responseText = newResponse;

        // If AI enhancement is selected, call the API
        if (isAI) {
            setIsEnhancing(true);
            try {
                const response = await fetch('/api/ai/enhance', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        trigger: newTrigger,
                        response: newResponse,
                        industry
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    responseText = data.enhancedResponse;
                } else {
                    console.error('Failed to enhance response with AI');
                    // Continue with original response
                }
            } catch (error) {
                console.error('Error enhancing response:', error);
                // Continue with original response
            } finally {
                setIsEnhancing(false);
            }
        }

        const newResponseObj: ChatbotResponse = {
            id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            trigger: newTrigger,
            response: responseText,
            isAI
        };

        const updatedResponses = [...responses, newResponseObj];
        onChange(updatedResponses);

        // Reset form
        setNewTrigger('');
        setNewResponse('');
        setIsAI(false);
    };

    const handleDeleteResponse = (id: string) => {
        const updatedResponses = responses.filter(response => response.id !== id);
        onChange(updatedResponses);
    };

    // Add a function to enhance an existing response
    const handleEnhanceExisting = async (id: string, trigger: string, responseText: string) => {
        try {
            const response = await fetch('/api/ai/enhance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    trigger,
                    response: responseText,
                    industry
                }),
            });

            if (response.ok) {
                const data = await response.json();
                // Update the specific response
                const updatedResponses = responses.map(resp =>
                    resp.id === id
                        ? { ...resp, response: data.enhancedResponse, isAI: true }
                        : resp
                );
                onChange(updatedResponses);
            } else {
                console.error('Failed to enhance response with AI');
            }
        } catch (error) {
            console.error('Error enhancing response:', error);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Chatbot Responses</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {responses.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No responses yet. Add your first response below.</p>
                        ) : (
                            <div className="space-y-2">
                                {responses.map((response) => (
                                    <div
                                        key={response.id}
                                        className="p-3 border rounded-md flex justify-between items-start"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium">Trigger:</span>
                                                <span className="text-sm">{response.trigger}</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-sm font-medium">Response:</span>
                                                <span className="text-sm">{response.response}</span>
                                            </div>
                                            {response.isAI && (
                                                <span className="mt-1 inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                    AI Enhanced
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {!response.isAI && (
                                                <button
                                                    onClick={() => handleEnhanceExisting(response.id, response.trigger, response.response)}
                                                    className="text-blue-500 hover:text-blue-700 text-sm"
                                                >
                                                    Enhance with AI
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteResponse(response.id)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="pt-4 border-t">
                            <h4 className="text-sm font-medium mb-3">Add New Response</h4>
                            <div className="space-y-3">
                                <div>
                                    <label htmlFor="trigger" className="block text-sm font-medium mb-1">
                                        Trigger Phrase or Keyword
                                    </label>
                                    <input
                                        id="trigger"
                                        type="text"
                                        value={newTrigger}
                                        onChange={(e) => setNewTrigger(e.target.value)}
                                        placeholder="e.g. shipping, return policy, opening hours"
                                        className="w-full p-2 border rounded-md bg-background text-foreground"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="response" className="block text-sm font-medium mb-1">
                                        Response
                                    </label>
                                    <textarea
                                        id="response"
                                        value={newResponse}
                                        onChange={(e) => setNewResponse(e.target.value)}
                                        placeholder="Your chatbot's answer to this query"
                                        rows={3}
                                        className="w-full p-2 border rounded-md bg-background text-foreground"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        id="ai-enhanced"
                                        type="checkbox"
                                        checked={isAI}
                                        onChange={(e) => setIsAI(e.target.checked)}
                                        className="mr-2"
                                    />
                                    <label htmlFor="ai-enhanced" className="text-sm font-medium">
                                        Use AI to enhance this response
                                    </label>
                                </div>

                                <button
                                    onClick={handleAddResponse}
                                    disabled={!newTrigger || !newResponse || isEnhancing}
                                    className="w-full bg-foreground text-background py-2 rounded-md hover:bg-opacity-90 disabled:opacity-50"
                                >
                                    {isEnhancing ? 'Enhancing with AI...' : 'Add Response'}
                                </button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}