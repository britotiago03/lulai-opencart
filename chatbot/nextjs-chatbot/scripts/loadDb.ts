import { DataAPIClient } from "@datastax/astra-db-ts";
import OpenAI from "openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import fetch from "node-fetch";
import "dotenv/config";

const { ASTRA_DB_NAMESPACE, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN, OPENAI_API_KEY } = process.env;

// Initialize OpenAI and AstraDB clients
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

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
    details?: string[];
    specifications?: { [key: string]: string };
  };
}

// Create collection dynamically for each store (ensuring uniqueness)
const createCollection = async (collectionName: string, similarityMetric: "dot_product" | "cosine" | "euclidean" = "dot_product") => {
  const res = await db.createCollection(collectionName, {
    vector: {
      dimension: 1536,
      metric: similarityMetric,
    },
  });
  console.log(`Collection created: ${collectionName}`, res);
};

// Fetch product data dynamically based on platform
const fetchProductData = async (url: string, platform: string, apiKey?: string): Promise<ProductData[]> => {
  console.log(`Fetching product data from ${platform} at ${url}...`);

  if (platform === "opencart") return await fetchOpenCartData(url, apiKey);
  if (platform === "shopify") return await fetchShopifyData(url, apiKey);
  if (platform === "magento") return await fetchMagentoData(url, apiKey);
  if (platform === "customstore") return await fetchCustomStoreData(url); // Handle our custom store that we are maknig right now
  
  throw new Error("Unsupported platform");
};

// Fetch OpenCart product data
const fetchOpenCartData = async (url: string, apiKey?: string): Promise<ProductData[]> => {
  if (!url.startsWith("http://") && !url.startsWith("https://")) throw new Error("Invalid URL");

  const fetchUrl = apiKey ? `${url}&api_key=${apiKey}` : url;
  const response = await fetch(fetchUrl);
  if (!response.ok) throw new Error("Failed to fetch OpenCart data");

  const data = await response.json();
  return data.map((product: any) => ({
    id: product.id,
    name: product.name,
    price: product.price,
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

// Fetch Shopify product data
const fetchShopifyData = async (url: string, apiKey?: string): Promise<ProductData[]> => {
  if (!apiKey) throw new Error("Shopify requires an API key!");

  const response = await fetch(url, { headers: { "X-Shopify-Access-Token": apiKey } });
  if (!response.ok) throw new Error("Failed to fetch Shopify data");

  const data = await response.json();
  return data.products.map((product: any) => ({
    id: product.id,
    name: product.title,
    price: product.variants[0].price,
    quantity: product.variants[0].inventory_quantity,
    sku: product.variants[0].sku,
    model: product.variants[0].option1,
    image: product.image.src,
    category: product.product_type,
    url: product.handle,
    availability: product.variants[0].available ? "In Stock" : "Out of Stock",
    description: product.body_html,
  }));
};

// Fetch Magento product data
const fetchMagentoData = async (url: string, apiKey?: string): Promise<ProductData[]> => {
  if (!apiKey) throw new Error("Magento requires an API key!");

  const response = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!response.ok) throw new Error("Failed to fetch Magento data");

  const data = await response.json();
  return data.items.map((product: any) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: product.stock_status,
    sku: product.sku,
    model: product.model,
    image: product.image_url,
    category: product.category,
    url: product.url,
    availability: product.is_in_stock ? "In Stock" : "Out of Stock",
    description: product.description,
  }));
};

// Fetch Custom Store product data
const fetchCustomStoreData = async (url: string): Promise<ProductData[]> => {
  if (!url.startsWith("http://") && !url.startsWith("https://")) throw new Error("Invalid URL");

  try {
    console.log(`Fetching products from ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Failed to fetch Custom Store data: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch Custom Store data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.length} products`);
    
    // Create a baseUrl from the product URL for relative path resolution
    const baseUrl = new URL(url);
    baseUrl.pathname = '/'; // Reset to root
    
    return Promise.all(data.map(async (product: any) => {
      // Format description without fetching the file
      const formattedDescription = {
        title: product.name,
        overview: `${product.name} by ${product.brand}`,
        details: `${product.category} product with ID ${product.id}`,
        specifications: `Brand: ${product.brand}\nCategory: ${product.category}\nPrice: $${product.price}`
      };
      
      // Try to fetch description, but don't fail if it doesn't work
      try {
        // Resolve relative URL if needed
        const descriptionUrl = new URL(product.description_file, baseUrl.toString()).toString();
        console.log(`Trying to fetch description from ${descriptionUrl}`);
        
        const descriptionResponse = await fetch(descriptionUrl);
        if (descriptionResponse.ok) {
          const descriptionData = await descriptionResponse.json();
          // Replace with actual description if successfully fetched
          formattedDescription.title = descriptionData.title || formattedDescription.title;
          formattedDescription.overview = descriptionData.overview || formattedDescription.overview;
          formattedDescription.details = descriptionData.details?.join("\n") || formattedDescription.details;
          formattedDescription.specifications = Object.entries(descriptionData.specifications || {})
            .map(([key, value]) => `${key}: ${value}`).join("\n") || formattedDescription.specifications;
        }
      } catch (descError) {
        console.warn(`Could not fetch description for ${product.name}, using fallback: ${descError.message}`);
        // Continue with the fallback description created above
      }

      return {
        id: product.id.toString(),
        name: product.name,
        price: product.price.toString(),
        quantity: "Unknown",
        sku: "",
        model: product.brand,
        image: product.images[0],
        category: product.category,
        url: `/product/${product.id}`,
        availability: "In Stock",
        description: formattedDescription,
      };
    }));
  } catch (error) {
    console.error("Error in fetchCustomStoreData:", error);
    throw error;
  }
};

// Store products into AstraDB
const storeProductData = async (products: ProductData[], collectionName: string) => {
  try {
    console.log("Creating collection if not exists...");
    await createCollection(collectionName);
    const collection = await db.collection(collectionName);

    for (const product of products) {
      console.log(`Processing product: ${product.name}`);

      // Split product description into chunks for embedding
      const chunks = await splitter.splitText(product.name);
      for (const chunk of chunks) {
        // Generate embeddings
        const embeddings = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: chunk,
          encoding_format: "float",
        });
        const vector = embeddings.data[0].embedding;

        // Store product with structured description
        await collection.insertOne({
          $vector: vector,
          text: chunk,
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
          description_details: product.description?.details,
          description_specifications: product.description?.specifications,
        });

        console.log(`Stored product: ${product.name}`);
      }
    }
    console.log("All products stored successfully!");
  } catch (error) {
    console.error("Error storing product data", error);
    throw error;
  }
};


// Main function to load products
export const loadProductDataForStore = async ({
  storeName,
  productApiUrl,
  platform,
  apiKey,
}: {
  storeName: string;
  productApiUrl: string;
  platform: string;
  apiKey?: string;
}) => {
  try {
    console.log(`Starting integration for ${storeName}...`);
    
    // Define collection name dynamically using storeName to ensure uniqueness
    const collectionName = `store_${storeName.replace(/\s+/g, "_").toLowerCase()}`;

    console.log("Fetching product data...");
    const products = await fetchProductData(productApiUrl, platform, apiKey);

    console.log("Storing product data...");
    await storeProductData(products, collectionName);

    console.log(`Integration complete for ${storeName}!`);
  } catch (error) {
    console.error(`Error loading product data: ${error.message}`);
    throw error;
  }
};
