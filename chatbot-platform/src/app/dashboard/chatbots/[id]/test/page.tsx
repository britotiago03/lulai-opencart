// src/app/dashboard/chatbots/[id]/test/page.tsx
import ChatbotTester from "@/components/chatbots/ChatbotTester";

export default function ChatbotTestPage({ params }: { params: { id: string } }) {
    return <ChatbotTester id={params.id} />;
}