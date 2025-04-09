"use client";
import ChatbotEditClientPage from "@/components/chatbots/ChatbotEditClient";
import { useParams } from "next/navigation";

export default function EditChatbotPage() {
    const params = useParams<{ id: string }>();
    const id = params.id;

    return (
        <ChatbotEditClientPage id={id}/>
    );
}