// src/components/chatbots/ChatbotForm.tsx
"use client";

import { useState } from 'react';
import { Industry, ChatbotResponse } from '@/lib/db/schema';
import ResponseEditor from './ResponseEditor';
import TemplateSelector from './TemplateSelector';

interface ChatbotFormProps {
    onSubmit: (data: {
        storeName: string;
        description: string;
        industry: Industry;
        responses: ChatbotResponse[];
        apiUrl?: string;
        platform?: string;
        apiKey?: string;
        customPrompt?: string;
    }) => void;
    isSubmitting?: boolean;
}

export default function ChatbotForm({ onSubmit, isSubmitting = false }: ChatbotFormProps) {
    const [formData, setFormData] = useState({
        storeName: '',
        description: '',
        industry: 'general' as Industry,
        responses: [] as ChatbotResponse[],
        apiUrl: '',
        platform: 'lulAI',
        apiKey: '',
        customPrompt: ''
    });;

    console.log('Initial form state:', formData);

    const [currentStep, setCurrentStep] = useState<'info' | 'template' | 'responses'>('info');

    const industries: Industry[] = ['fashion', 'electronics', 'general', 'food', 'beauty'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        onSubmit(formData);
    };

    const handleResponsesChange = (responses: ChatbotResponse[]) => {
        setFormData(prev => ({ ...prev, responses }));
    };

    const handleTemplateSelect = (responses: ChatbotResponse[]) => {
        setFormData(prev => ({ ...prev, responses }));
        setCurrentStep('responses');
    };

    const handleNextStep = () => {
        if (currentStep === 'info') {
            setCurrentStep('template');
        } else if (currentStep === 'template') {
            setCurrentStep('responses');
        }
    };

    const handlePrevStep = () => {
        if (currentStep === 'responses') {
            setCurrentStep('template');
        } else if (currentStep === 'template') {
            setCurrentStep('info');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 'info' && (
                <div className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                            Chatbot Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.storeName}
                            onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
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

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleNextStep}
                            className="bg-foreground text-background py-2 px-4 rounded-md hover:bg-opacity-90"
                            disabled={!formData.storeName}
                        >
                            Next: Choose Template
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Template Selection */}
            {currentStep === 'template' && (
                <div className="space-y-6">
                    <TemplateSelector
                        selectedIndustry={formData.industry}
                        onSelectTemplate={handleTemplateSelect}
                    />

                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={handlePrevStep}
                            className="border border-foreground text-foreground py-2 px-4 rounded-md hover:bg-opacity-10 hover:bg-foreground"
                        >
                            Back: Basic Info
                        </button>
                        <button
                            type="button"
                            onClick={handleNextStep}
                            className="bg-foreground text-background py-2 px-4 rounded-md hover:bg-opacity-90"
                        >
                            Skip: Add Responses Manually
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Response Editor */}
            {currentStep === 'responses' && (
                <div className="space-y-6">
                    <ResponseEditor
                        responses={formData.responses}
                        onChange={handleResponsesChange}
                        industry={formData.industry}
                    />

                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={handlePrevStep}
                            className="border border-foreground text-foreground py-2 px-4 rounded-md hover:bg-opacity-10 hover:bg-foreground"
                        >
                            Back: Templates
                        </button>
                        <button
                            type="submit"
                            className="bg-foreground text-background py-2 px-4 rounded-md hover:bg-opacity-90"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating Chatbot...' : 'Create Chatbot'}
                        </button>
                    </div>
                </div>
            )}
        </form>
    );
}