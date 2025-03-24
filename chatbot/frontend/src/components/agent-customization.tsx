'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface AgentCustomizationProps {
    sessionId: string;
}

const personalities = [
    { id: 'professional', name: 'Professional', description: 'Formal, precise, and business-like' },
    { id: 'friendly', name: 'Friendly', description: 'Warm, casual, and approachable' },
    { id: 'enthusiastic', name: 'Enthusiastic', description: 'Energetic, positive, and engaging' },
    { id: 'technical', name: 'Technical', description: 'Detailed, informative, and expert-like' },
];

const AgentCustomization = ({ sessionId }: AgentCustomizationProps) => {
    const [agentName, setAgentName] = useState('Product Assistant');
    const [selectedPersonality, setSelectedPersonality] = useState('friendly');
    const [customInstructions, setCustomInstructions] = useState('');
    const [accentColor, setAccentColor] = useState('#3b82f6'); // Default blue
    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState('');
    const router = useRouter();

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogo(file);

            // Create a preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Save customization settings to localStorage
            const sessionDataString = localStorage.getItem(`session_${sessionId}`);
            if (!sessionDataString) {
                console.error('Session data not found');
                router.push('/service'); // Redirect to service page
                return; // Exit the function
            }

            const sessionData = JSON.parse(sessionDataString);
            const updatedSessionData = {
                ...sessionData,
                name: agentName,
                personality: selectedPersonality,
                customInstructions,
                accentColor,
                hasLogo: !!logo
            };

            localStorage.setItem(`session_${sessionId}`, JSON.stringify(updatedSessionData));

            // Upload logo if provided
            if (logo) {
                const formData = new FormData();
                formData.append('logo', logo);
                formData.append('sessionId', sessionId);

                const response = await fetch('/api/upload-logo', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    console.warn('Failed to upload logo, but continuing with agent setup');
                }
            }

            // Redirect to the AI agent page
            router.push(`/ai-agent?sessionId=${sessionId}`);
        } catch (error) {
            console.error('Error saving agent customization:', error);
            // Continue to AI agent page even if customization fails
            router.push(`/ai-agent?sessionId=${sessionId}`);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <Card className="bg-gray-900/60 border-gray-700 text-white">
                <CardHeader>
                    <CardTitle className="text-2xl">Customize Your AI Agent</CardTitle>
                    <CardDescription className="text-gray-300">
                        Personalize how your AI agent looks, behaves, and responds to users
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Agent Name */}
                        <div className="space-y-2">
                            <Label htmlFor="agent-name" className="text-white">Agent Name</Label>
                            <Input
                                id="agent-name"
                                value={agentName}
                                onChange={(e) => setAgentName(e.target.value)}
                                placeholder="Enter a name for your AI Agent"
                                className="bg-gray-800 border-gray-700 text-white"
                            />
                        </div>

                        {/* Personality Selection */}
                        <div className="space-y-4">
                            <Label className="text-white">Personality</Label>
                            <RadioGroup
                                value={selectedPersonality}
                                onValueChange={setSelectedPersonality}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                {personalities.map((personality) => (
                                    <div key={personality.id} className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value={personality.id}
                                            id={personality.id}
                                            className="text-white"
                                        />
                                        <Label
                                            htmlFor={personality.id}
                                            className="cursor-pointer flex flex-col"
                                        >
                                            <span className="font-medium">{personality.name}</span>
                                            <span className="text-sm text-gray-400">{personality.description}</span>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        {/* Custom Instructions */}
                        <div className="space-y-2">
                            <Label htmlFor="custom-instructions" className="text-white">
                                Custom Instructions
                            </Label>
                            <Textarea
                                id="custom-instructions"
                                value={customInstructions}
                                onChange={(e) => setCustomInstructions(e.target.value)}
                                placeholder="Add specific instructions for how your AI agent should respond (optional)"
                                className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                            />
                        </div>

                        {/* Accent Color */}
                        <div className="space-y-2">
                            <Label htmlFor="accent-color" className="text-white">Accent Color</Label>
                            <div className="flex space-x-4 items-center">
                                <Input
                                    id="accent-color"
                                    type="color"
                                    value={accentColor}
                                    onChange={(e) => setAccentColor(e.target.value)}
                                    className="w-16 h-10 p-1 bg-transparent border-gray-700"
                                />
                                <span className="text-gray-300">
                  This color will be used for your agent's theme
                </span>
                            </div>
                        </div>

                        {/* Logo Upload */}
                        <div className="space-y-2">
                            <Label htmlFor="logo-upload" className="text-white">Logo (Optional)</Label>
                            <div className="flex items-center space-x-4">
                                <div
                                    className="w-16 h-16 rounded-md border border-gray-600 flex items-center justify-center overflow-hidden bg-gray-800"
                                >
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Input
                                        id="logo-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        className="bg-gray-800 border-gray-700 text-white"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        Recommended: Square image, 512x512px or larger
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white"
                            >
                                Create AI Agent
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AgentCustomization;