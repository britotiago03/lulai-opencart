import { render, screen } from "@testing-library/react";
import AgentCard from "../AgentCard";
import { Chatbot } from "@/app/dashboard/agents/page";

const bot: Chatbot = {
    id: "1",
    name: "TestBot",
    description: "A test chatbot",
    industry: "E-commerce",
    platform: "Web",
    api_key: "abc123",
    product_api_url: "https://example.com",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

describe("AgentCard", () => {
    it("renders chatbot data", () => {
        render(<AgentCard chatbot={bot} />);
        expect(screen.getByText("TestBot")).toBeInTheDocument();
        expect(screen.getByText("A test chatbot")).toBeInTheDocument();
        expect(screen.getByText("E-commerce")).toBeInTheDocument();
        expect(screen.getByText("Conversations")).toBeInTheDocument();
        expect(screen.getByText("Analytics")).toBeInTheDocument();
        expect(screen.getByText("Settings")).toBeInTheDocument();
    });
});
