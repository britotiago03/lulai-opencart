// src/app/dashboard/chatbots/[id]/page.tsx
// This is a Server Component
import ChatbotDetailsClient from "@/components/chatbots/ChatbotDetailsClient";

export default function ChatbotDetailPageWrapper({ params }: { params: { id: string } }) {
    return <ChatbotDetailsClient id={params.id} />;
}