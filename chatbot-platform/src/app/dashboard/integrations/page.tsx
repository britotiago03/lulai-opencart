"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Globe, ShoppingCart, Code, Loader, Download, Palette, Monitor } from "lucide-react";

export default function Integrate() {
  const [formData, setFormData] = useState({
    storeName: "",
    productApiUrl: "",
    platform: "",
    apiKey: "",
    customPrompt: "",
    industry: "",
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
  });

  const [responseMsg, setResponseMsg] = useState("");
  const [progress, setProgress] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [buildingWidget, setBuildingWidget] = useState(false);
  const [widgetBuilt, setWidgetBuilt] = useState(false);
  const [widgetUrl, setWidgetUrl] = useState("");
  const [step, setStep] = useState(1); // Tracks the current step

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Clear error message when valid input is provided
    if (name === "storeName" && value.trim() !== "") {
      setErrors((prevErrors) => ({ ...prevErrors, storeName: "" }));
    }
    if (name === "productApiUrl" && value.trim() !== "") {
      setErrors((prevErrors) => ({ ...prevErrors, productApiUrl: "" }));
    }
  };

  const handleWidgetConfigChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setWidgetConfig((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handlePlatformSelect = (platform: string) => {
    setFormData((prevState) => ({
      ...prevState,
      platform,
    }));
    setStep(2); // Move to Step 2 after platform selection
  };

  const handleNext = () => {
    // Validate storeName and productApiUrl are not empty
    let valid = true;
    const newErrors = { storeName: "", productApiUrl: "" };

    if (!formData.storeName.trim()) {
      newErrors.storeName = "Store Name cannot be empty";
      valid = false;
    }
    if (!formData.productApiUrl.trim()) {
      newErrors.productApiUrl = "Product API URL cannot be empty";
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      setStep(step + 1); // Move to next step only if valid
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleBuildWidget = async () => {
    setBuildingWidget(true);
  
    try {
      // Create a combined object with all configuration
      const config = {
        widgetConfig
      };
  
      // Send the configuration to the server to build the widget
      const res = await fetch("/api/build-widget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
  
      if (!res.ok) {
        throw new Error("Failed to build widget");
      }
  
      const data = await res.json();
      setWidgetUrl(data.downloadUrl);
      setWidgetBuilt(true);
    } catch (error) {
      console.error("Error building widget:", error);
      setResponseMsg("Error building widget, please try again.");
    } finally {
      setBuildingWidget(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProgress(["Starting store integration..."]);

    try {
      const res = await fetch("http://localhost:3001/api/storage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          widgetConfig
        }),
        mode: "cors",
      });

      const result = await res.json();
      if (res.ok) {
        setLoading(false);
        setResponseMsg("Integration successful!");

        // Send to PostgreSQL
        await fetch("/api/chatbots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        setLoading(false);
        setResponseMsg(`Error: ${result.message}`);
      }
    } catch (error) {
      setLoading(false);
      setResponseMsg("An error occurred during integration.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Integrate Your Store</h1>
        <p className="text-gray-500 mt-1">
          Follow these steps to integrate your store with our chatbot.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Step 1: Select a Platform</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Platform Selection Cards */}
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
                    <label className="block text-sm font-medium">API Key (Optional)</label>
                    <input
                      name="apiKey"
                      type="text"
                      value={formData.apiKey}
                      onChange={handleChange}
                      className="mt-1 p-2 w-full border rounded-md text-black bg-white"
                    />
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
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
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

        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Step 3: Customize Widget</h2>
            <p className="text-gray-500 mb-4">
              Personalize your chatbot widget to match your website's look and feel.
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
                    <p className="text-xs text-gray-500 mt-1">Used for user message bubbles</p>
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
                      {/* Basic Preview */}
                      <div className="relative h-full w-full overflow-hidden">
                        {/* Chat window preview */}
                        <div 
                          className="bg-white shadow-md rounded-md absolute right-16 bottom-16" 
                          style={{
                            width: `${Number(widgetConfig.windowWidth) * 0.4}px`,
                            height: `${Number(widgetConfig.windowHeight) * 0.4}px`,
                          }}
                        >
                          {/* Header */}
                          <div 
                            className="p-2 rounded-t-md text-white text-sm flex justify-between items-center"
                            style={{ backgroundColor: widgetConfig.primaryColor }}
                          >
                            <span>{widgetConfig.headerText}</span>
                            <span>×</span>
                          </div>
                          {/* Chat area */}
                          <div className="bg-gray-50 h-4/5"></div>
                          {/* Input area */}
                          <div className="p-1 border-t"></div>
                        </div>
                        
                        {/* Chat toggle button */}
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
              
              <div className="space-x-4">
                <button
                  type="button"
                  onClick={handleBuildWidget}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  disabled={buildingWidget}
                >
                  {buildingWidget ? (
                    <div className="flex items-center">
                      <Loader className="animate-spin h-5 w-5 mr-2" /> Building Widget...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Code className="h-5 w-5 mr-2" /> Build Widget
                    </div>
                  )}
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
            
            {widgetBuilt && (
              <div className="mt-6 p-4 border rounded-md bg-green-50">
                <h3 className="font-medium text-green-800 flex items-center">
                  <Download className="h-5 w-5 mr-2" /> 
                  Widget Successfully Built!
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Your custom widget is ready. You can download it now or continue with the integration.
                </p>
                <a 
                  href={widgetUrl} 
                  download="lulai-widget.js"
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" /> Download Widget
                </a>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Step 4: Custom System Prompt</h2>
            <p className="text-gray-500 mb-4">
              Here, you can write guidelines and policies for your chatbot. If you skip this part, a general customer
              service prompt will be used.
            </p>
            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <div>
                  <label className="block text-sm font-medium">Custom System Prompt</label>
                  <textarea
                    name="customPrompt"
                    value={formData.customPrompt}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border rounded-md text-black bg-white"
                    rows={6}
                    placeholder="You are a helpful customer service assistant for our store. Your goal is to help customers find products, answer questions about our services, and provide a pleasant experience."
                  />
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
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader className="animate-spin h-5 w-5 mr-2" /> Processing...
                  </div>
                ) : (
                  "Complete Integration"
                )}
              </button>
            </div>
          </div>
        )}
      </form>

      {loading && (
        <div className="mt-6">
          <p className="font-medium">Processing Store Data...</p>
          <progress value={progress.length} max="5" className="w-full h-2 bg-gray-200 rounded-full mt-2" />
          <ul className="mt-2 space-y-2">
            {progress.map((msg, index) => (
              <li key={index} className="text-gray-600 text-sm">
                {msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      {responseMsg && (
        <div className={`mt-4 p-4 rounded-md ${responseMsg.includes("Error") ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}>
          <p className="text-lg font-semibold">{responseMsg}</p>
          {!responseMsg.includes("Error") && widgetBuilt && (
            <div className="mt-4">
              <p className="mb-2">Add this code to your website to integrate the chatbot:</p>
              <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto text-sm">
                {`<script src="${widgetUrl}"></script>
<lulai-chat-widget 
  api-endpoint="http://your-backend-url/api/chat"
  store-name="${formData.storeName}"
></lulai-chat-widget>`}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
