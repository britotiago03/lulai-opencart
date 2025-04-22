import AgentCard from "./AgentCard";
import { Chatbot } from "@/app/dashboard/agents/page";

export default function AgentGrid({ chatbots }: { chatbots: Chatbot[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chatbots.map((bot) => (
                <AgentCard key={bot.id} chatbot={bot} />
            ))}
        </div>
    );
}
