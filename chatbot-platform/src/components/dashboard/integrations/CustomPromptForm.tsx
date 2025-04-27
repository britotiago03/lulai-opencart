// src/components/dashboard/integrations/CustomPromptForm.tsx
import { Card, CardContent } from "@/components/ui/card";
import React from "react";

interface CustomPromptFormProps {
    customPrompt: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export default function CustomPromptForm({ customPrompt, onChange }: CustomPromptFormProps) {
    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Step 3: Custom Instructions</h2>
            <p className="text-gray-400 mb-4">
                Guide the chatbot&apos;s behavior with custom instructions. Leave blank for default settings.
            </p>
            <Card className="shadow-lg bg-[#1b2539] border-0">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium">Custom Prompt</label>
                            <textarea
                                name="customPrompt"
                                value={customPrompt}
                                onChange={onChange}
                                className="mt-1 p-2 w-full border border-gray-700 rounded-md text-white bg-[#2a3349]"
                                rows={6}
                                placeholder="Example: Always respond in Spanish. Prioritize eco-friendly products. Never mention competitor brands."
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}