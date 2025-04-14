// src/app/dashboard/agents/[id]/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Save, AlertCircle } from "lucide-react";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import Link from "next/link";

interface WidgetConfig {
    primaryColor: string;
    secondaryColor: string;
    buttonSize: string;
    windowWidth: string;
    windowHeight: string;
    headerText: string;
    fontFamily: string;
}

export default function AgentSettingsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [chatbotName, setChatbotName] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [chatbotDescription, setChatbotDescription] = useState("");
    const [customPrompt, setCustomPrompt] = useState("");

    const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>({
        primaryColor: "#007bff",
        secondaryColor: "#e0f7fa",
        buttonSize: "60",
        windowWidth: "360",
        windowHeight: "500",
        headerText: "Chat with us",
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
    });

    // Active tab state
    const [activeTab, setActiveTab] = useState("general");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
            return;
        }

        const fetchChatbotData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch chatbot details
                const response = await fetch(`/api/chatbots/${id}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch chatbot details");
                }

                const chatbotData = await response.json();
                setChatbotName(chatbotData.name);
                setChatbotDescription(chatbotData.description);
                setApiKey(chatbotData.api_key);
                setCustomPrompt(chatbotData.custom_prompt || "");

                // Fetch widget configuration
                const widgetResponse = await fetch(`/api/chatbots/${id}/widget`);
                if (widgetResponse.ok) {
                    const widgetData = await widgetResponse.json();
                    setWidgetConfig({
                        primaryColor: widgetData.primary_color || "#007bff",
                        secondaryColor: widgetData.secondary_color || "#e0f7fa",
                        buttonSize: widgetData.button_size?.toString() || "60",
                        windowWidth: widgetData.window_width?.toString() || "360",
                        windowHeight: widgetData.window_height?.toString() || "500",
                        headerText: widgetData.header_text || "Chat with us",
                        fontFamily: widgetData.font_family || "Helvetica Neue, Helvetica, Arial, sans-serif",
                    });
                }
            } catch (err) {
                console.error("Error fetching chatbot data:", err);
                setError("Failed to load chatbot settings. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (status === "authenticated" && id) {
            fetchChatbotData();
        }
    }, [id, session, status, router]);

    const handleWidgetConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setWidgetConfig((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const saveWidgetConfig = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            const response = await fetch(`/api/chatbots/${id}/widget`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ widgetConfig }),
            });

            if (!response.ok) {
                throw new Error("Failed to update widget configuration");
            }

            setSuccess("Widget settings saved successfully!");
        } catch (err) {
            console.error("Error saving widget config:", err);
            setError("Failed to save widget settings. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const saveCustomPrompt = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            const response = await fetch(`/api/chatbots/${id}/prompt`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customPrompt }),
            });

            if (!response.ok) {
                throw new Error("Failed to update custom prompt");
            }

            setSuccess("Custom prompt saved successfully!");
        } catch (err) {
            console.error("Error saving custom prompt:", err);
            setError("Failed to save custom prompt. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const generateNewApiKey = async () => {
        if (confirm("Are you sure you want to generate a new API key? This will invalidate the old one and require updating your widget code.")) {
            try {
                setSaving(true);
                setError(null);
                setSuccess(null);

                const response = await fetch(`/api/chatbots/${id}/regenerate-api-key`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                });

                if (!response.ok) {
                    throw new Error("Failed to regenerate API key");
                }

                const data = await response.json();
                setApiKey(data.apiKey);
                setSuccess("API key regenerated successfully! Don't forget to update your widget code.");
            } catch (err) {
                console.error("Error regenerating API key:", err);
                setError("Failed to regenerate API key. Please try again.");
            } finally {
                setSaving(false);
            }
        }
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center mb-6">
                <Link href="/dashboard/agents" className="text-blue-500 hover:text-blue-400 mr-2">
                    ← Back to Agents
                </Link>
                <h1 className="text-2xl font-bold">Settings for {chatbotName}</h1>
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-900/30 text-red-500 p-4 rounded-md mb-6 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-900/20 border border-green-900/30 text-green-500 p-4 rounded-md mb-6 flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    {success}
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-800 mb-6">
                <button
                    className={`px-4 py-2 font-medium ${
                        activeTab === "general"
                            ? "text-blue-500 border-b-2 border-blue-500"
                            : "text-gray-400 hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("general")}
                >
                    General
                </button>
                <button
                    className={`px-4 py-2 font-medium ${
                        activeTab === "widget"
                            ? "text-blue-500 border-b-2 border-blue-500"
                            : "text-gray-400 hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("widget")}
                >
                    Widget Appearance
                </button>
                <button
                    className={`px-4 py-2 font-medium ${
                        activeTab === "prompt"
                            ? "text-blue-500 border-b-2 border-blue-500"
                            : "text-gray-400 hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("prompt")}
                >
                    Custom Prompt
                </button>
            </div>

            {/* General Settings */}
            {activeTab === "general" && (
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Chatbot Name</label>
                                <input
                                    type="text"
                                    value={chatbotName}
                                    onChange={(e) => setChatbotName(e.target.value)}
                                    className="w-full p-2 bg-[#2a3349] border border-gray-700 rounded-md text-white"
                                    disabled  // Disable for now as we're not implementing name updates
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={chatbotDescription}
                                    onChange={(e) => setChatbotDescription(e.target.value)}
                                    className="w-full p-2 bg-[#2a3349] border border-gray-700 rounded-md text-white"
                                    rows={3}
                                    disabled  // Disable for now as we're not implementing description updates
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
                                        onClick={() => {
                                            navigator.clipboard.writeText(apiKey);
                                            setSuccess("API key copied to clipboard!");
                                        }}
                                    >
                                        Copy
                                    </button>
                                    <button
                                        className="ml-2 p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                        onClick={generateNewApiKey}
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
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                                `<script src="${window.location.origin}/widgets/lulai-widget-${apiKey.substring(0, 10)}.js"></script>
<lulai-chat-widget 
  api-endpoint="${process.env.NEXT_PUBLIC_CHATBOT_URL || "http://localhost:3005"}/api/chat"
  api-key="${apiKey}"
></lulai-chat-widget>`
                                            );
                                            setSuccess("Installation code copied to clipboard!");
                                        }}
                                    >
                                        Copy Code
                                    </button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Widget Appearance Settings */}
            {activeTab === "widget" && (
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Primary Color</label>
                                <div className="flex items-center">
                                    <input
                                        type="color"
                                        name="primaryColor"
                                        value={widgetConfig.primaryColor}
                                        onChange={handleWidgetConfigChange}
                                        className="h-10 w-14"
                                    />
                                    <input
                                        type="text"
                                        name="primaryColor"
                                        value={widgetConfig.primaryColor}
                                        onChange={handleWidgetConfigChange}
                                        className="ml-2 p-2 border border-gray-700 rounded-md w-full text-white bg-[#2a3349]"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Used for chat button and header.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Secondary Color</label>
                                <div className="flex items-center">
                                    <input
                                        type="color"
                                        name="secondaryColor"
                                        value={widgetConfig.secondaryColor}
                                        onChange={handleWidgetConfigChange}
                                        className="h-10 w-14"
                                    />
                                    <input
                                        type="text"
                                        name="secondaryColor"
                                        value={widgetConfig.secondaryColor}
                                        onChange={handleWidgetConfigChange}
                                        className="ml-2 p-2 border border-gray-700 rounded-md w-full text-white bg-[#2a3349]"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Used for user message bubbles.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Button Size (px)</label>
                                <input
                                    type="number"
                                    name="buttonSize"
                                    value={widgetConfig.buttonSize}
                                    onChange={handleWidgetConfigChange}
                                    min="40"
                                    max="100"
                                    className="p-2 w-full border border-gray-700 rounded-md text-white bg-[#2a3349]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Window Width (px)</label>
                                <input
                                    type="number"
                                    name="windowWidth"
                                    value={widgetConfig.windowWidth}
                                    onChange={handleWidgetConfigChange}
                                    min="300"
                                    max="500"
                                    className="p-2 w-full border border-gray-700 rounded-md text-white bg-[#2a3349]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Window Height (px)</label>
                                <input
                                    type="number"
                                    name="windowHeight"
                                    value={widgetConfig.windowHeight}
                                    onChange={handleWidgetConfigChange}
                                    min="400"
                                    max="700"
                                    className="p-2 w-full border border-gray-700 rounded-md text-white bg-[#2a3349]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Header Text</label>
                                <input
                                    type="text"
                                    name="headerText"
                                    value={widgetConfig.headerText}
                                    onChange={handleWidgetConfigChange}
                                    className="p-2 w-full border border-gray-700 rounded-md text-white bg-[#2a3349]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Font Family</label>
                                <select
                                    name="fontFamily"
                                    value={widgetConfig.fontFamily}
                                    onChange={handleWidgetConfigChange}
                                    className="p-2 w-full border border-gray-700 rounded-md text-white bg-[#2a3349]"
                                >
                                    <option value="Helvetica Neue, Helvetica, Arial, sans-serif">Helvetica</option>
                                    <option value="'Roboto', sans-serif">Roboto</option>
                                    <option value="'Open Sans', sans-serif">Open Sans</option>
                                    <option value="'Lato', sans-serif">Lato</option>
                                    <option value="'Arial', sans-serif">Arial</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold mb-4">Widget Preview</h3>
                            <div className="border border-gray-700 rounded-md p-4">
                                <div
                                    className="relative bg-gray-800 rounded-md flex items-center justify-center"
                                    style={{
                                        height: `${Number(widgetConfig.windowHeight) * 0.5 + 64}px`,
                                        minHeight: `${Number(widgetConfig.buttonSize) * 0.7 + 64}px`,
                                    }}
                                >
                                    <div className="relative h-full w-full overflow-hidden">
                                        {/* Chat Window Preview */}
                                        <div
                                            className="bg-[#2a3349] shadow-md rounded-md absolute right-8 bottom-8"
                                            style={{
                                                width: `${Number(widgetConfig.windowWidth) * 0.5}px`,
                                                height: `${Number(widgetConfig.windowHeight) * 0.5}px`,
                                                transformOrigin: "bottom right",
                                            }}
                                        >
                                            <div
                                                className="p-2 rounded-t-md text-white text-sm flex justify-between items-center"
                                                style={{ backgroundColor: widgetConfig.primaryColor }}
                                            >
                                                <span>{widgetConfig.headerText}</span>
                                                <span>×</span>
                                            </div>
                                            {/* Chat Messages Preview */}
                                            <div className="bg-gray-800 h-4/5 p-2 overflow-y-auto">
                                                <div className="flex justify-start mb-2">
                                                    <div
                                                        className="bg-gray-600 rounded-lg p-2 max-w-[70%]"
                                                        style={{ color: "#fff" }}
                                                    >
                                                        How can I help you?
                                                    </div>
                                                </div>
                                                <div className="flex justify-end">
                                                    <div
                                                        className="rounded-lg p-2 max-w-[70%]"
                                                        style={{
                                                            backgroundColor: widgetConfig.secondaryColor,
                                                            color: "#000",
                                                        }}
                                                    >
                                                        Sample question
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-1 border-t border-gray-700"></div>
                                        </div>

                                        {/* Chat Button Preview */}
                                        <div
                                            className="absolute right-4 bottom-4 flex items-center justify-center text-white font-bold rounded-full shadow-md"
                                            style={{
                                                backgroundColor: widgetConfig.primaryColor,
                                                width: `${Number(widgetConfig.buttonSize) * 0.7}px`,
                                                height: `${Number(widgetConfig.buttonSize) * 0.7}px`,
                                            }}
                                        >
                                            +
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={saveWidgetConfig}
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
            )}

            {/* Custom Prompt Settings */}
            {activeTab === "prompt" && (
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6">
                        <div>
                            <label className="block text-lg font-medium mb-2">Custom Prompt</label>
                            <p className="text-gray-400 mb-4">
                                Customize how your chatbot responds to users. This prompt provides personality and behavior instructions to the AI.
                            </p>
                            <textarea
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                className="w-full p-4 bg-[#2a3349] border border-gray-700 rounded-md text-white font-mono"
                                rows={12}
                                placeholder="Example: You are a helpful assistant for our store. Be friendly, concise, and focus on providing accurate product information..."
                            />
                            <div className="mt-2 text-sm text-gray-400">
                                <p>Guidelines for effective prompts:</p>
                                <ul className="list-disc pl-5 mt-1 space-y-1">
                                    <li>Start with a clear definition of the chatbot's role</li>
                                    <li>Define the tone (formal, friendly, professional)</li>
                                    <li>Specify how to handle product questions</li>
                                    <li>Provide instruction on recommending products</li>
                                    <li>Guide responses to common customer service inquiries</li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={saveCustomPrompt}
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
            )}
        </div>
    );
}