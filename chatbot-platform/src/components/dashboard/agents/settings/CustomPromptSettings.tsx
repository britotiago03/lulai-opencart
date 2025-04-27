// src/components/dashboard/agents/settings/CustomPromptSettings.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Save } from "lucide-react";

interface CustomPromptSettingsProps {
    customPrompt: string;
    onChange: (value: string) => void;
    onSave: () => Promise<void>;
    saving: boolean;
}

export default function CustomPromptSettings({
                                                 customPrompt,
                                                 onChange,
                                                 onSave,
                                                 saving
                                             }: CustomPromptSettingsProps) {
    return (
        <Card className="bg-[#1b2539] border-0">
            <CardContent className="p-6">
                <div>
                    <label className="block text-lg font-medium mb-2">Custom Prompt</label>
                    <p className="text-gray-400 mb-4">
                        Customize how your chatbot responds to users. This prompt provides personality and behavior instructions to the AI.
                    </p>
                    <textarea
                        value={customPrompt}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full p-4 bg-[#2a3349] border border-gray-700 rounded-md text-white font-mono"
                        rows={12}
                        placeholder="Example: You are a helpful assistant for our store. Be friendly, concise, and focus on providing accurate product information..."
                    />
                    <div className="mt-2 text-sm text-gray-400">
                        <p>Guidelines for effective prompts:</p>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Start with a clear definition of the chatbot&apos;s role</li>
                            <li>Define the tone (formal, friendly, professional)</li>
                            <li>Specify how to handle product questions</li>
                            <li>Provide instruction on recommending products</li>
                            <li>Guide responses to common customer service inquiries</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    >
                        {saving ? (
                            <>
                                <span className="animate-spin mr-2">⟳</span> Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" /> Save Changes
                            </>
                        )}
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}