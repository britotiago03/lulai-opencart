// loadDb.ts
import { DataAPIClient } from "@datastax/astra-db-ts";
import OpenAI from "openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import fetch from "node-fetch";
import "dotenv/config";

const { ASTRA_DB_NAMESPACE, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN, OPENAI_API_KEY } = process.env;

// Function to get a fresh DB client to prevent session expiration issues
const getDbClient = () => {
  return new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN).db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });
};

// Initialize OpenAI and AstraDB clients
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

// Sanitize API key for collection names
const sanitizeApiKey = (apiKey: string) => {
  return apiKey.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
};

// Define ProductData structure
export interface ProductData {
  id: string;
  name: string;
  price: string;
  special?: string;
  quantity: string;
  sku: string;
  model: string;
  image: string;
  category: string;
  url: string;
  availability: string;
  description?: {
    title?: string;
    overview?: string;
    details?: string;
    specifications?: string;
  };
}

// Helper function to format specifications object to a plain text string
const formatSpecifications = (specs: any): string => {
  if (!specs || typeof specs !== "object") return "";
  return Object.entries(specs)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
};

// Helper function to format details (array or other) into a plain text string
const formatDetails = (details: any): string => {
  if (!details) return "";
  if (Array.isArray(details)) {
    return details.join("; ");
  }
  return details.toString();
};

// Ensure absolute URLs
const resolveUrl = (baseUrl: string, relativeUrl: string): string => {
  if (!relativeUrl) return "";
  if (relativeUrl.startsWith("http")) return relativeUrl;
  return new URL(relativeUrl, baseUrl).toString();
};

// Create collection dynamically for each API key
const createCollection = async (
  collectionName: string,
  isVectorCollection: boolean = true,
  similarityMetric: "dot_product" | "cosine" | "euclidean" = "dot_product"
) => {
  const db = getDbClient();
  const options = isVectorCollection ? { vector: { dimension: 1536, metric: similarityMetric } } : {};
  const res = await db.createCollection(collectionName, options);
  console.log(`Collection created: ${collectionName}`, res);
};

// Fetch product data dynamically
const fetchProductData = async (url: string, platform: string, apiKey?: string): Promise<ProductData[]> => {
  console.log(`Fetching product data from ${platform} at ${url}...`);

  if (platform === "opencart") return await fetchOpenCartData(url, apiKey);
  if (platform === "shopify") return await fetchShopifyData(url, apiKey);
  if (platform === "customstore") return await fetchCustomStoreData(url);

  throw new Error("Unsupported platform");
};

// OpenCart implementation
const fetchOpenCartData = async (url: string, apiKey?: string): Promise<ProductData[]> => {
  const fetchUrl = apiKey ? `${url}&api_key=${apiKey}` : url;
  const response = await fetch(fetchUrl);
  if (!response.ok) throw new Error("Failed to fetch OpenCart data");

  const data = await response.json();
  return data.map((product: any) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    special: product.special || "",
    quantity: product.quantity,
    sku: product.sku,
    model: product.model,
    image: product.image,
    category: product.category,
    url: product.url,
    availability: product.availability,
    description: product.description,
  }));
};

// Shopify implementation
const fetchShopifyData = async (url: string, apiKey?: string): Promise<ProductData[]> => {
  if (!apiKey) throw new Error("Shopify requires an API key!");

  const response = await fetch(url, { headers: { "X-Shopify-Access-Token": apiKey } });
  if (!response.ok) throw new Error("Failed to fetch Shopify data");

  const data = await response.json();
  const baseUrl = new URL(url).origin;

  return data.products.map((product: any) => ({
    id: product.id.toString(),
    name: product.title,
    price: product.variants[0]?.price || "0",
    quantity: product.variants[0]?.inventory_quantity?.toString() || "Unknown",
    sku: product.variants[0]?.sku || "",
    model: product.variants[0]?.option1 || "",
    image: resolveUrl("https:", product.image?.src),
    category: product.product_type || "Unknown",
    url: resolveUrl(baseUrl, `/products/${product.handle}`),
    availability: product.variants[0]?.available ? "In Stock" : "Out of Stock",
    description: {
      title: product.title,
      overview: product.body_html,
      details: formatDetails([`Vendor: ${product.vendor}`, `Type: ${product.type}`]),
      specifications: formatSpecifications({ Tags: product.tags.join(", ") }),
    },
  }));
};

// Custom Store implementation
const fetchCustomStoreData = async (url: string): Promise<ProductData[]> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch Custom Store data");

  const data = await response.json();
  const baseUrl = new URL(url).origin;

  return await Promise.all(data.map(async (product: any) => {
    const formattedDescription = {
      title: product.name,
      overview: `${product.name} by ${product.brand}`,
      details: formatDetails([`Category: ${product.category}`, `Brand: ${product.brand}`]),
      specifications: formatSpecifications({ Price: `$${product.price}` }),
    };

    try {
      const descriptionUrl = resolveUrl(baseUrl, product.description_file);
      const descriptionResponse = await fetch(descriptionUrl);
      if (descriptionResponse.ok) {
        const descriptionData = await descriptionResponse.json();
        formattedDescription.title = descriptionData.title || formattedDescription.title;
        formattedDescription.overview = descriptionData.overview || formattedDescription.overview;
        formattedDescription.details = descriptionData.details ? formatDetails(descriptionData.details) : formattedDescription.details;
        formattedDescription.specifications = descriptionData.specifications ? formatSpecifications(descriptionData.specifications) : formattedDescription.specifications;
      }
    } catch {
      console.warn(`Failed to fetch description for ${product.name}, using fallback.`);
    }

    return {
      id: product.id.toString(),
      name: product.name,
      price: product.price.toString(),
      quantity: "Unknown",
      sku: "",
      model: product.brand,
      image: resolveUrl(baseUrl, product.images[0]),
      category: product.category,
      url: resolveUrl(baseUrl, `/product/${product.id}`),
      availability: "In Stock",
      description: formattedDescription,
    };
  }));
};

// Store products in AstraDB using API key-based collection name
const storeProductData = async (products: ProductData[], apiKey: string) => {
  const sanitizedKey = sanitizeApiKey(apiKey);
  const collectionName = `${sanitizedKey}_productlist`;

  try {
    console.log("Ensuring collection exists...");
    await createCollection(collectionName);
    let db = getDbClient();
    let collection = await db.collection(collectionName);

    for (const product of products) {
      console.log(`Processing product: ${product.name}`);

      let vector;
      try {
        const embeddings = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: product.description?.overview || "",
          encoding_format: "float",
        });
        vector = embeddings.data[0].embedding;
      } catch (error: any) {
        console.error(`Embedding generation failed for ${product.name}: ${error.message}`);
        continue;
      }

      try {
        await collection.insertOne({
          $vector: vector,
          text: product.description?.overview || "",
          product_id: product.id,
          product_name: product.name,
          price: product.price,
          quantity: product.quantity,
          sku: product.sku,
          model: product.model,
          image: product.image,
          category: product.category,
          url: product.url,
          availability: product.availability,
          description_title: product.description?.title,
          description_overview: product.description?.overview,
          description_details: product.description?.details || "",
          description_specifications: product.description?.specifications || "",
        });
        console.log(`Stored product: ${product.name}`);
      } catch (error: any) {
        if (error.message.includes("session has been destroyed")) {
          console.warn("Session expired, reconnecting...");
          db = getDbClient();
          collection = await db.collection(collectionName);
        } else {
          console.error(`Error inserting product: ${product.name} - ${error.message}`);
          continue;
        }
      }
    }
    console.log("All products stored successfully!");
  } catch (error) {
    console.error("Error storing product data", error);
    throw error;
  }
};

// Store custom system prompt using API key-based collection name
const storeSystemPrompt = async (apiKey: string, customPrompt: string) => {
  const sanitizedKey = sanitizeApiKey(apiKey);
  const promptCollectionName = `${sanitizedKey}_prompt`;

  await createCollection(promptCollectionName, false);
  const db = getDbClient();
  const promptCollection = await db.collection(promptCollectionName);

  await promptCollection.insertOne({
    id: "system_prompt",
    content: customPrompt,
  });

  console.log(`Stored custom prompt for API key: ${apiKey}`);
};

// Main integration function
export const loadProductDataForStore = async ({
  storeName,
  productApiUrl,
  platform,
  apiKey,
  customPrompt,
}: {
  storeName: string;
  productApiUrl: string;
  platform: string;
  apiKey: string;
  customPrompt?: string;
}) => {
  console.log(`Starting integration for API key: ${apiKey}`);

  if (!apiKey) throw new Error("API key is required");

  const products = await fetchProductData(productApiUrl, platform, apiKey);
  await storeProductData(products, apiKey);

  if (customPrompt) {
    await storeSystemPrompt(apiKey, customPrompt);
  }

  console.log(`Integration complete for API key: ${apiKey}`);
};

// Update custom system prompt
export const updateSystemPrompt = async (apiKey: string, customPrompt: string) => {
  const sanitizedKey = sanitizeApiKey(apiKey);
  const promptCollectionName = `${sanitizedKey}_prompt`;
  const db = getDbClient();
  const promptCollection = await db.collection(promptCollectionName);

  try {
    await promptCollection.updateOne(
      { id: "system_prompt" },
      { $set: { content: customPrompt } }
    );
    console.log(`Updated custom prompt for API key: ${apiKey}`);
  } catch (error: any) {
    console.error(`Error updating custom prompt: ${error.message}`);
    throw error;
  }
};