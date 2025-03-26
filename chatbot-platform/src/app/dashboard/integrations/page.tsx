// chatbot-platform/src/app/dashboard/integrations/page.tsx
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Globe, ShoppingCart, Code, Loader, Download } from "lucide-react";

export default function Integrate() {
  const [formData, setFormData] = useState({
    storeName: "",
    productApiUrl: "",
    platform: "",
    apiKey: "",
    industry: "",
    customPrompt: "",
  });

  const [widgetConfig, setWidgetConfig] = useState({
    primaryColor: "#007bff",
    secondaryColor: "#e0f7fa",
    buttonSize: "60",
    windowWidth: "360",
    windowHeight: "500",
    headerText: "Chat with us",
    fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
  });

  const [errors, setErrors] = useState({
    storeName: "",
    productApiUrl: "",
    industry: "",
    apiKey: "",
  });

  const [responseMsg, setResponseMsg] = useState("");
  const [progress, setProgress] = useState<string[]>([]);
  const [buildingWidget, setBuildingWidget] = useState(false);
  const [widgetBuilt, setWidgetBuilt] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (value.trim() !== "") {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleWidgetConfigChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setWidgetConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlatformSelect = (platform: string) => {
    setFormData((prev) => ({ ...prev, platform }));
    setStep(2);
  };

  const generateApiKey = () => {
    // Generate 16 random bytes (128 bits)
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    
    // Convert to hex string
    const key = Array.from(array, byte => 
      byte.toString(16).padStart(2, '0')
    ).join('');
  
    setFormData((prev) => ({ ...prev, apiKey: key }));
  };

  const handleNext = () => {
    let valid = true;
    const newErrors = { storeName: "", productApiUrl: "", industry: "", apiKey: "" };

    if (step === 2) {
      if (!formData.storeName.trim()) {
        newErrors.storeName = "Store name cannot be empty";
        valid = false;
      }
      if (!formData.productApiUrl.trim()) {
        newErrors.productApiUrl = "Product API URL cannot be empty";
        valid = false;
      }
      if (!formData.industry.trim()) {
        newErrors.industry = "Please select an industry";
        valid = false;
      }
      if (!formData.apiKey.trim()) {
        newErrors.apiKey = "Generate an API Key to continue";
        valid = false;
      }
    }

    setErrors(newErrors);
    if (valid) setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleBuildWidget = async () => {
    setBuildingWidget(true);
    setProgress(["Starting integration process..."]);
    setResponseMsg("");
  
    try {
      // Fix 1: Add proper method to storage request
      setProgress(prev => [...prev, "Saving custom prompt to AstraDB..."]);
      const storageRes = await fetch("http://localhost:3005/api/storage", {
        method: "POST", // Ensure method is specified
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), // Send full form data
      });
  
      // Fix 2: Add method to chatbot request
      setProgress(prev => [...prev, "Saving chatbot details to PostgreSQL..."]);
      const chatbotRes = await fetch("/api/chatbots", {
        method: "POST", // Explicit method declaration
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      // Fix 3: Verify build-widget endpoint
      setProgress(prev => [...prev, "Building widget package..."]);
      const widgetRes = await fetch("/api/build-widget", {
        method: "POST", // Must use POST for sending JSON body
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          integration: formData,
          widgetConfig
        }),
      });
  
      const widgetData = await widgetRes.json();
      if (!widgetRes.ok) throw new Error(widgetData.message || "Widget build failed");
  
      setDownloadUrl(widgetData.downloadUrl);
      setWidgetBuilt(true);
      setResponseMsg("Integration successful!");
      setProgress(prev => [...prev, "All systems updated!"]);
  
    } catch (error) {
      console.error("Integration error:", error);
      setResponseMsg(error instanceof Error ? error.message : "Integration failed");
      setProgress(prev => [...prev, "Error occurred during integration"]);
    } finally {
      setBuildingWidget(false);
    }
  };
  

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Integrate Your Store</h1>
        <p className="text-gray-500 mt-1">
          Follow these steps to securely integrate your store with our chatbot.
        </p>
      </div>

      {/* Step 1: Platform Selection */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Step 1: Select a Platform</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <div onClick={() => handlePlatformSelect("opencart")} className="cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-center text-xl font-semibold">
                    OpenCart
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Globe className="mx-auto h-12 w-12 text-blue-500" />
                </CardContent>
              </div>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <div onClick={() => handlePlatformSelect("shopify")} className="cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-center text-xl font-semibold">
                    Shopify
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <ShoppingCart className="mx-auto h-12 w-12 text-blue-500" />
                </CardContent>
              </div>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <div onClick={() => handlePlatformSelect("customstore")} className="cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-center text-xl font-semibold">
                    Custom Store
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Code className="mx-auto h-12 w-12 text-blue-500" />
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Step 2: Store Details & API Key Generation */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Step 2: Enter Store Details</h2>
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium">Store Name</label>
                  <input
                    name="storeName"
                    type="text"
                    value={formData.storeName}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border rounded-md text-black bg-white"
                  />
                  {errors.storeName && (
                    <p className="text-red-500 text-sm mt-1">{errors.storeName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium">Product API URL</label>
                  <input
                    name="productApiUrl"
                    type="url"
                    value={formData.productApiUrl}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border rounded-md text-black bg-white"
                  />
                  {errors.productApiUrl && (
                    <p className="text-red-500 text-sm mt-1">{errors.productApiUrl}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium">Industry</label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border rounded-md text-black bg-white"
                  >
                    <option value="">Select an Industry</option>
                    {["fashion", "electronics", "general", "food", "beauty"].map(
                      (industry) => (
                        <option key={industry} value={industry}>
                          {industry.charAt(0).toUpperCase() + industry.slice(1)}
                        </option>
                      )
                    )}
                  </select>
                  {errors.industry && (
                    <p className="text-red-500 text-sm mt-1">{errors.industry}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">API Key</label>
                  <div className="flex space-x-2">
                    <input
                      name="apiKey"
                      type="text"
                      value={formData.apiKey}
                      onChange={handleChange}
                      readOnly
                      placeholder="Click generate to create API key"
                      className="mt-1 p-2 w-full border rounded-md text-black bg-gray-100"
                    />
                    <button
                      type="button"
                      onClick={generateApiKey}
                      className="mt-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Generate API Key
                    </button>
                  </div>
                  {errors.apiKey && (
                    <p className="text-red-500 text-sm mt-1">{errors.apiKey}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={handlePrevious}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Custom System Prompt */}
      {step === 3 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Step 3: Custom Instructions</h2>
          <p className="text-gray-500 mb-4">
            Guide the chatbot's behavior with custom instructions. Leave blank for default settings.
          </p>
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium">Custom Prompt</label>
                  <textarea
                    name="customPrompt"
                    value={formData.customPrompt}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border rounded-md text-black bg-white"
                    rows={6}
                    placeholder="Example: Always respond in Spanish. Prioritize eco-friendly products. Never mention competitor brands."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={handlePrevious}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Customize Widget */}
      {step === 4 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Step 4: Customize Widget</h2>
          <p className="text-gray-500 mb-4">
            Personalize your chatbot widget appearance and behavior.
          </p>
          <Card className="shadow-lg mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium">Primary Color</label>
                  <div className="flex items-center mt-1">
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
                      className="ml-2 p-2 border rounded-md w-full text-black bg-white"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Used for header and buttons</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium">Secondary Color</label>
                  <div className="flex items-center mt-1">
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
                      className="ml-2 p-2 border rounded-md w-full text-black bg-white"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Used for chat bubbles</p>
                </div>

                <div>
                  <label className="block text-sm font-medium">Button Size (px)</label>
                  <input
                    name="buttonSize"
                    type="number"
                    min="40"
                    max="100"
                    value={widgetConfig.buttonSize}
                    onChange={handleWidgetConfigChange}
                    className="mt-1 p-2 w-full border rounded-md text-black bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Window Width (px)</label>
                  <input
                    name="windowWidth"
                    type="number"
                    min="300"
                    max="500"
                    value={widgetConfig.windowWidth}
                    onChange={handleWidgetConfigChange}
                    className="mt-1 p-2 w-full border rounded-md text-black bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Window Height (px)</label>
                  <input
                    name="windowHeight"
                    type="number"
                    min="400"
                    max="700"
                    value={widgetConfig.windowHeight}
                    onChange={handleWidgetConfigChange}
                    className="mt-1 p-2 w-full border rounded-md text-black bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Header Text</label>
                  <input
                    name="headerText"
                    type="text"
                    value={widgetConfig.headerText}
                    onChange={handleWidgetConfigChange}
                    className="mt-1 p-2 w-full border rounded-md text-black bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Font Family</label>
                  <select
                    name="fontFamily"
                    value={widgetConfig.fontFamily}
                    onChange={handleWidgetConfigChange}
                    className="mt-1 p-2 w-full border rounded-md text-black bg-white"
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
                <div className="border rounded-md p-4">
                  <div className="mb-2 text-sm font-medium">Widget Preview</div>
                  <div className="relative bg-gray-100 rounded-md h-64 flex items-center justify-center">
                    <div className="relative h-full w-full overflow-hidden">
                      <div 
                        className="bg-white shadow-md rounded-md absolute right-16 bottom-16" 
                        style={{
                          width: `${Number(widgetConfig.windowWidth) * 0.4}px`,
                          height: `${Number(widgetConfig.windowHeight) * 0.4}px`,
                        }}
                      >
                        <div 
                          className="p-2 rounded-t-md text-white text-sm flex justify-between items-center"
                          style={{ backgroundColor: widgetConfig.primaryColor }}
                        >
                          <span>{widgetConfig.headerText}</span>
                          <span>×</span>
                        </div>
                        <div className="bg-gray-50 h-4/5"></div>
                        <div className="p-1 border-t"></div>
                      </div>
                      <div 
                        className="absolute right-6 bottom-6 flex items-center justify-center text-white font-bold rounded-full shadow-md"
                        style={{
                          backgroundColor: widgetConfig.primaryColor,
                          width: `${Number(widgetConfig.buttonSize) * 0.6}px`,
                          height: `${Number(widgetConfig.buttonSize) * 0.6}px`,
                        }}
                      >
                        +
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={handlePrevious}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Build Widget */}
      {step === 5 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Step 5: Build & Integrate</h2>
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Integration Summary</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Store Name:</span> {formData.storeName}</p>
                  <p><span className="font-medium">Platform:</span> {formData.platform}</p>
                  <p><span className="font-medium">Industry:</span> {formData.industry}</p>
                  <p><span className="font-medium">Custom Prompt:</span> {formData.customPrompt || "Using default"}</p>
                </div>
              </div>

              {buildingWidget && (
                <div className="mt-6">
                  <p className="font-medium">Integration Progress</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
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
              )}

              <button
                type="button"
                onClick={handleBuildWidget}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors mt-6"
                disabled={buildingWidget}
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

              {widgetBuilt && downloadUrl && (
                <div className="mt-6 p-4 border rounded-md bg-green-50">
                  <h3 className="font-medium text-green-800 flex items-center">
                    <Download className="h-5 w-5 mr-2" /> Integration Successful!
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Your custom widget is ready for download and installation.
                  </p>
                  <a 
                    href={downloadUrl} 
                    download="lulai-widget.js"
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" /> Download Widget
                  </a>
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>Embed Code:</strong>
                    <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                      {`<script src="${downloadUrl}"></script>
<lulai-chat-widget 
  api-endpoint="http://localhost:3005/api/chat"
  api-key="${formData.apiKey}"
></lulai-chat-widget>`}
                    </pre>
                  </div>
                </div>
              )}

              {responseMsg && (
                <div className={`mt-4 p-4 rounded-md ${
                  responseMsg.includes("Error") ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"
                }`}>
                  <p className="text-lg font-semibold">{responseMsg}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={handlePrevious}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}