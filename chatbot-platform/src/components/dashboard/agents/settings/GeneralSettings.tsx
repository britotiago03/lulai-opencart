// src/components/dashboard/agents/settings/GeneralSettings.tsx
import { Card, CardContent } from "@/components/ui/card";

interface GeneralSettingsProps {
    chatbotName: string;
    chatbotDescription: string;
    apiKey: string;
    onCopyApiKey: () => void;
    onRegenerateApiKey: () => void;
    onCopyInstallationCode: () => void;
}

export default function GeneralSettings({
                                            chatbotName,
                                            chatbotDescription,
                                            apiKey,
                                            onCopyApiKey,
                                            onRegenerateApiKey,
                                            onCopyInstallationCode
                                        }: GeneralSettingsProps) {
    return (
        <Card className="bg-[#1b2539] border-0">
            <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Chatbot Name</label>
                        <input
                            type="text"
                            value={chatbotName}
                            className="w-full p-2 bg-[#2a3349] border border-gray-700 rounded-md text-white"
                            disabled
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            value={chatbotDescription}
                            className="w-full p-2 bg-[#2a3349] border border-gray-700 rounded-md text-white"
                            rows={3}
                            disabled
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">API Key</label>
                        <div className="flex">
                            <input
                                type="text"
                                value={apiKey}
                                readOnly
                                className="w-full p-2 bg-[#2a3349] border border-gray-700 rounded-md text-white"
                            />
                            <button
                                className="ml-2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                onClick={onCopyApiKey}
                            >
                                Copy
                            </button>
                            <button
                                className="ml-2 p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                onClick={onRegenerateApiKey}
                            >
                                Regenerate
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            {apiKey ? "This API key is used to authenticate your chatbot. Keep it secure!" : "Generate an API key to authenticate your chatbot."}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-2">Installation Instructions</h3>
                        <div className="bg-[#232b3c] p-4 rounded-md">
                            <p className="text-sm text-gray-300 mb-4">
                                Add the following code to your website to integrate your chatbot:
                            </p>
                            <pre className="bg-gray-800 p-3 rounded overflow-x-auto border border-gray-700 text-gray-300 text-sm">
{`<script src="${window.location.origin}/widgets/lulai-widget-${apiKey.substring(0, 10)}.js"></script>
<lulai-chat-widget 
  api-endpoint="${process.env.NEXT_PUBLIC_CHATBOT_URL || "http://localhost:3005"}/api/chat"
  api-key="${apiKey}"
></lulai-chat-widget>`}
                            </pre>
                            <button
                                className="mt-3 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                onClick={onCopyInstallationCode}
                            >
                                Copy Code
                            </button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}