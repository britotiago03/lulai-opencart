// src/components/dashboard/WelcomeCard.tsx
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface WelcomeCardProps {
    userName: string;
    hasChatbots: boolean;
}

export default function WelcomeCard({ userName, hasChatbots }: WelcomeCardProps) {
    return (
        <Card className="bg-[#1b2539] border-0">
            <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between flex-wrap">
                    <Link href={`/dashboard/integrations`} className="flex items-center">
                        <div className="bg-blue-600/20 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-semibold">Welcome back, {userName}</h2>
                            <p className="text-gray-400 mt-1">Here&apos;s an overview of your chatbot and its performance</p>
                        </div>
                    </Link>
                    {!hasChatbots ? (
                        <Link
                            href={`/dashboard/integrations`}
                            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Create Your First Chatbot
                        </Link>
                    ) : (
                        <Link
                            href={`/dashboard/integrations`}
                            className="mt-4 md:mt-0 px-4 py-2 border border-blue-600 text-blue-500 rounded-md hover:bg-blue-900/20 transition-colors"
                        >
                            Manage Chatbot
                        </Link>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}