// src/components/dashboard/integrations/BuildIntegration.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Loader, Download } from "lucide-react";
import { IntegrationFormData } from "@/types/integrations";

interface BuildIntegrationProps {
    formData: IntegrationFormData;
    buildingWidget: boolean;
    widgetBuilt: boolean;
    progress: string[];
    responseMsg: string;
    downloadUrl: string | null;
    onBuild: () => void;
}

export default function BuildIntegration({
                                             formData,
                                             buildingWidget,
                                             widgetBuilt,
                                             progress,
                                             responseMsg,
                                             downloadUrl,
                                             onBuild
                                         }: BuildIntegrationProps) {
    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Step 5: Build & Integrate</h2>
            <Card className="shadow-lg bg-[#1b2539] border-0">
                <CardContent className="pt-6">
                    <IntegrationSummary formData={formData} />

                    {buildingWidget && <ProgressIndicator progress={progress} />}

                    <BuildButton
                        onBuild={onBuild}
                        buildingWidget={buildingWidget}
                        widgetBuilt={widgetBuilt}
                    />

                    {widgetBuilt && downloadUrl && (
                        <SuccessMessage downloadUrl={downloadUrl} apiKey={formData.apiKey} />
                    )}

                    {responseMsg && (
                        <StatusMessage message={responseMsg} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

interface IntegrationSummaryProps {
    formData: IntegrationFormData;
}

function IntegrationSummary({ formData }: IntegrationSummaryProps) {
    return (
        <div className="mb-4">
            <h3 className="font-semibold mb-2">Integration Summary</h3>
            <div className="space-y-2 text-sm">
                <p><span className="font-medium">Store Name:</span> {formData.storeName}</p>
                <p><span className="font-medium">Platform:</span> {formData.platform}</p>
                <p><span className="font-medium">Industry:</span> {formData.industry}</p>
                <p><span className="font-medium">Custom Prompt:</span> {formData.customPrompt || "Using default"}</p>
            </div>
        </div>
    );
}

interface ProgressIndicatorProps {
    progress: string[];
}

function ProgressIndicator({ progress }: ProgressIndicatorProps) {
    return (
        <div className="mt-6">
            <p className="font-medium">Integration Progress</p>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${(progress.length / 4) * 100}%` }}
                ></div>
            </div>
            <ul className="mt-4 space-y-2">
                {progress.map((msg, index) => (
                    <li key={index} className="flex items-center text-sm">
                        <Loader className="animate-spin h-4 w-4 mr-2" />
                        {msg}
                    </li>
                ))}
            </ul>
        </div>
    );
}

interface BuildButtonProps {
    onBuild: () => void;
    buildingWidget: boolean;
    widgetBuilt: boolean;
}

function BuildButton({ onBuild, buildingWidget, widgetBuilt }: BuildButtonProps) {
    return (
        <button
            type="button"
            onClick={onBuild}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors mt-6"
            disabled={buildingWidget || widgetBuilt}
        >
            {buildingWidget ? (
                <div className="flex items-center justify-center">
                    <Loader className="animate-spin h-5 w-5 mr-2" /> Building Integration...
                </div>
            ) : (
                <div className="flex items-center justify-center">
                    <Download className="h-5 w-5 mr-2" /> Build & Integrate
                </div>
            )}
        </button>
    );
}

interface SuccessMessageProps {
    downloadUrl: string;
    apiKey: string;
}

function SuccessMessage({ downloadUrl, apiKey }: SuccessMessageProps) {
    return (
        <div className="mt-6 p-4 border border-gray-700 rounded-md bg-green-900/20">
            <h3 className="font-medium text-green-400 flex items-center">
                <Download className="h-5 w-5 mr-2" /> Integration Successful!
            </h3>
            <p className="mt-2 text-sm text-gray-300">
                Your custom widget is ready for download and installation.
            </p>
            <a
                href={downloadUrl}
                download="lulai-widget.js"
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
                <Download className="h-4 w-4 mr-2" /> Download Widget
            </a>
            <div className="mt-4 text-sm text-gray-300">
                <strong>Embed Code:</strong>
                <pre className="bg-gray-800 p-3 rounded mt-2 overflow-x-auto border border-gray-700">
{`<script src="${downloadUrl}"></script>
<lulai-chat-widget 
  api-endpoint="${process.env.NEXT_PUBLIC_CHATBOT_URL || "http://localhost:3005"}/api/chat"
  api-key="${apiKey}"
></lulai-chat-widget>`}
                </pre>
            </div>
        </div>
    );
}

interface StatusMessageProps {
    message: string;
}

function StatusMessage({ message }: StatusMessageProps) {
    const isError = message.includes("Error") || message.includes("failed");

    return (
        <div className={`mt-4 p-4 rounded-md ${
            isError
                ? "bg-red-900/20 text-red-400 border border-red-800/50"
                : "bg-green-900/20 text-green-400 border border-green-800/50"
        }`}>
            <p className="text-lg font-semibold">{message}</p>
        </div>
    );
}