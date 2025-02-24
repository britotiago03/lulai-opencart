"use client";

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ChatbotForm from '@/components/chatbots/ChatbotForm';
import { useRouter } from 'next/navigation';

export default function CreateChatbotPage() {
    const router = useRouter();

    const handleSubmit = (data: {
        name: string;
        description: string;
        industry: string;
    }) => {
        console.log('Form submitted:', data);
        // In a real app, we would send this data to an API
        // Then redirect to the chatbot list or the new chatbot page
        alert(`Chatbot "${data.name}" created successfully!`);
        router.push('/dashboard/chatbots');
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Chatbot</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChatbotForm onSubmit={handleSubmit} />
                </CardContent>
            </Card>
        </div>
    );
}