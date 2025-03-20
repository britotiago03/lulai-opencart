/* chatbot-platform/src/app/dashboard/integrations/page.tsx */
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Globe, ShoppingCart, Code, Loader } from "lucide-react";

export default function Integrate() {
  const [formData, setFormData] = useState({
    storeName: "",
    productApiUrl: "",
    platform: "",
    apiKey: "",
    customPrompt: "",
    industry: "",
  });

  const [errors, setErrors] = useState({
    storeName: "",
    productApiUrl: "",
  });

  const [responseMsg, setResponseMsg] = useState("");
  const [progress, setProgress] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
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
      setStep(3); // Move to Step 3 only if valid
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProgress(["Starting store integration..."]);

    const res = await fetch("http://localhost:3001/api/storage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
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
              <Card className="cursor-pointer">
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

              <Card className="cursor-pointer">
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

              <Card className="cursor-pointer">
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
              <CardContent>
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

            <div className="text-right mt-4">
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
            <h2 className="text-xl font-bold mb-4">Step 3: Custom System Prompt</h2>
            <p className="text-gray-500 mb-4">
              Here, you can write guidelines and policies for your chatbot. If you skip this part, a general customer
              service prompt will be used.
            </p>
            <Card className="shadow-lg">
              <CardContent>
                <div>
                  <label className="block text-sm font-medium">Custom System Prompt</label>
                  <textarea
                    name="customPrompt"
                    value={formData.customPrompt}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border rounded-md text-black bg-white"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="text-right mt-4">
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
                  "Integrate"
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

      {responseMsg && <p className="mt-4 text-lg font-semibold text-green-600">{responseMsg}</p>}
    </div>
  );
}
