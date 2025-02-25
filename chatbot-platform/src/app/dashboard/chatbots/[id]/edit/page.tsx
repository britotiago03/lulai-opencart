// src/app/dashboard/chatbots/[id]/edit/page.tsx
import ChatbotEditClient from "@/components/chatbots/ChatbotEditClient";

export default function ChatbotEditPage({ params }: { params: { id: string } }) {
    return <ChatbotEditClient id={params.id} />;
}