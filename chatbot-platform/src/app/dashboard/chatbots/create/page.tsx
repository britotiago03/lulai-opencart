// src/app/dashboard/chatbots/create/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ChatbotForm from '@/components/chatbots/ChatbotForm';
import { useRouter } from 'next/navigation';
import { ChatbotResponse, Industry } from '@/lib/db/schema';
import { SessionProvider, useSession } from 'next-auth/react';
import LoadingSkeleton from '@/components/loading/LoadingSkeleton';

function CreateChatbotPageContent() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if the user is authenticated
        if (status === "unauthenticated") {
            router.push('/auth/signin'); 
            router.refresh();
            return;
        } else {
            setLoading(false);
        }
    }, [session, router]);

    const handleSubmit = async (data: {
        storeName: string;
        description: string;
        industry: Industry;
        responses: ChatbotResponse[];
        apiUrl?: string;
        platform?: string;
        apiKey?: string;
        customPrompt?: string;
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
    
    if(loading) {
        return (
            <LoadingSkeleton />
        );
    }

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

export default function CreateChatbotPage() {
    return (
        <SessionProvider>
            <CreateChatbotPageContent />
        </SessionProvider>
    );
}