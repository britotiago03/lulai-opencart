"use client";

import { useState } from "react";

export default function Integrate() {
  const [formData, setFormData] = useState({
    storeName: "",
    productApiUrl: "",
    platform: "opencart", // Default platform
    apiKey: "", // Optional
    customPrompt: "", // Added custom prompt input
  });
  const [responseMsg, setResponseMsg] = useState("");
  const [progress, setProgress] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Handle input changes for different types of elements (input, select, textarea)
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,  // Update the correct field based on the `name` attribute
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProgress(["Starting store integration..."]);

    // Send the POST request to initiate the integration
    const res = await fetch("/api/storage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result = await res.json();
    if (res.ok) {
      // If POST was successful, listen for progress updates using EventSource
      const eventSource = new EventSource("/api/storage");

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setProgress((prev) => [...prev, data.status]); // Append each status message

        if (data.status === "Integration complete!") {
          eventSource.close();
          setLoading(false);
          setResponseMsg("Integration successful!");
        }
      };

      eventSource.onerror = () => {
        setProgress((prev) => [...prev, "An error occurred. Please try again."]);
        eventSource.close();
        setLoading(false);
      };
    } else {
      setLoading(false);
      setResponseMsg(`Error: ${result.message}`);
    }
  };

  return (
    <div>
      <h1>Integrate Your Store</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Store Name:</label>
          <input
            name="storeName"
            type="text"
            value={formData.storeName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Product API URL:</label>
          <input
            name="productApiUrl"
            type="url"
            value={formData.productApiUrl}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Platform:</label>
          <select name="platform" value={formData.platform} onChange={handleChange}>
            <option value="opencart">OpenCart</option>
            <option value="shopify">Shopify</option>
            <option value="magento">Magento</option>
            <option value="customstore">Custom Store</option>
          </select>
        </div>
        <div>
          <label>API Key (Optional):</label>
          <input
            name="apiKey"
            type="text"
            value={formData.apiKey}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Custom System Prompt (Optional):</label>
          <textarea
            name="customPrompt"
            value={formData.customPrompt}
            onChange={handleChange}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Integrate"}
        </button>
      </form>

      {loading && (
        <div>
          <p>Processing Store Data...</p>
          <progress value={progress.length} max="5"></progress>
          <ul>
            {progress.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {responseMsg && <p>{responseMsg}</p>}
    </div>
  );
}
