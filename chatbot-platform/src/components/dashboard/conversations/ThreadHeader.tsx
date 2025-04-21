import Link from "next/link";

export default function ThreadHeader({
                                         userId,
                                         chatbot,
                                     }: {
    userId: string;
    chatbot: { id: string; name: string } | null;
}) {
    return (
        <div className="mb-6">
            <h1 className="text-2xl font-bold">Conversation Thread</h1>
            <div className="flex items-center">
                <p className="text-gray-400 mt-1">User: {userId}</p>
                {chatbot && (
                    <Link
                        href={`/dashboard/agents/${chatbot.id}`}
                        className="ml-4 text-blue-500 hover:text-blue-400"
                    >
                        <span className="text-gray-400">
                            Via: <span className="text-blue-500">{chatbot.name}</span>
                        </span>
                    </Link>
                )}
            </div>
        </div>
    );
}
