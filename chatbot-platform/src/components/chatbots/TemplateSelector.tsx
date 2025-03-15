// src/components/chatbots/TemplateSelector.tsx
"use client";

import { useState, useEffect } from 'react';
import { Industry, ChatbotResponse, ChatbotTemplate } from '@/lib/db/schema';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface TemplateSelectorProps {
    selectedIndustry: Industry;
    onSelectTemplate: (responses: ChatbotResponse[]) => void;
}

interface TemplateResponse {
    id?: string;
    trigger: string;
    response: string;
    isAI: boolean;
}

interface TemplateData {
    id: string;
    name: string;
    industry: Industry;
    description: string;
    presetResponses: TemplateResponse[];
}

export default function TemplateSelector({ selectedIndustry, onSelectTemplate }: TemplateSelectorProps) {
    const [templates, setTemplates] = useState<ChatbotTemplate[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/templates?industry=${selectedIndustry}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch templates');
                }

                const data = await response.json() as TemplateData[];

                // Ensure all responses have an ID
                const processedData = data.map((template) => ({
                    ...template,
                    presetResponses: template.presetResponses.map((response) => ({
                        ...response,
                        // Ensure ID exists, if not generate a temporary one
                        id: response.id || `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
                    }))
                }));

                setTemplates(processedData as ChatbotTemplate[]);
            } catch (error) {
                console.error('Error fetching templates:', error);
                setError('Failed to load templates. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, [selectedIndustry]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Loading Templates...</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Please wait while we load templates for your industry.</p>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Error Loading Templates</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-red-500">{error}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        You can continue without templates or try refreshing the page.
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (templates.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>No Templates Available</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        No templates found for this industry. You can create your own responses in the next step.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Choose a Template</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                    Start with a pre-built template for your industry to save time. You can customize responses after applying the template.
                </p>

                <div className="space-y-4">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            className="border rounded-md p-4 hover:bg-slate-50 cursor-pointer"
                            onClick={() => onSelectTemplate(template.presetResponses)}
                        >
                            <h3 className="font-medium">{template.name}</h3>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                            <div className="mt-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {template.presetResponses.length} preset responses
                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}