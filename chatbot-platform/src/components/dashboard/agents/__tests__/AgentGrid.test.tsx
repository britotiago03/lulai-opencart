import { render, screen } from "@testing-library/react";
import AgentGrid from "../AgentGrid";
import { Chatbot } from "@/app/dashboard/agents/page";

const mockChatbots: Chatbot[] = [
    {
        id: "1",
        name: "Bot A",
        description: "Description A",
        industry: "Retail",
        platform: "Web",
        api_key: "key-a",
        product_api_url: "http://api.com",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "2",
        name: "Bot B",
        description: "Description B",
        industry: "Finance",
        platform: "App",
        api_key: "key-b",
        product_api_url: "http://api.com",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
];

describe("AgentGrid", () => {
    it("renders a card for each chatbot", () => {
        render(<AgentGrid chatbots={mockChatbots} />);
        expect(screen.getByText("Bot A")).toBeInTheDocument();
        expect(screen.getByText("Bot B")).toBeInTheDocument();
    });
});
