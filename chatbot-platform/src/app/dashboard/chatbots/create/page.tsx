// src/app/dashboard/chatbots/create/page.tsx
"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ChatbotForm from '@/components/chatbots/ChatbotForm';
import { useRouter } from 'next/navigation';
import { ChatbotResponse, Industry } from '@/lib/db/schema';

export default function CreateChatbotPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: {
        name: string;
        description: string;
        industry: Industry;
        responses: ChatbotResponse[];
    }) => {
        try {
            setIsSubmitting(true);
            console.log('Form submitted:', data);

            // Send data to API
            const response = await fetch('/api/chatbots', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create chatbot');
            }

            const createdChatbot = await response.json();

            // Show success message
            alert(`Chatbot "${createdChatbot.name}" created successfully!`);

            // Navigate back to the chatbot list
            router.push('/dashboard/chatbots');
        } catch (error) {
            console.error('Error creating chatbot:', error);
            alert(`Failed to create chatbot: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Chatbot</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChatbotForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
                </CardContent>
            </Card>
        </div>
    );
}