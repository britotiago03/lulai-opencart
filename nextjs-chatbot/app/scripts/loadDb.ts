import { Pool } from 'pg';
import OpenAI from 'openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import fetch from 'node-fetch';
import 'dotenv/config';

const { OPENAI_API_KEY, DATABASE_URL } = process.env;

// Initialize OpenAI and PostgreSQL pool
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

// Sanitize API key for table names
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

// Create tables dynamically for each API key
const createTables = async (tableName: string, isProductTable: boolean = true) => {
  const client = await pool.connect();
  try {
    // First check if the pgvector extension exists
    await client.query('CREATE EXTENSION IF NOT EXISTS vector;');

    // Now create the table if it doesn't exist
    await client.query('BEGIN');
    if (isProductTable) {
      // Create product table with pgvector column for embeddings
      await client.query(`
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id SERIAL PRIMARY KEY,
          vector VECTOR(1536),
          text TEXT,
          product_id VARCHAR(255),
          product_name VARCHAR(255),
          price VARCHAR(255),
          quantity VARCHAR(255),
          sku VARCHAR(255),
          model VARCHAR(255),
          image TEXT,
          category VARCHAR(255),
          url TEXT,
          availability VARCHAR(255),
          description_title TEXT,
          description_overview TEXT,
          description_details TEXT,
          description_specifications TEXT
        )
      `);
    } else {
      // Create prompt table
      await client.query(`
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id VARCHAR(255) PRIMARY KEY,
          content TEXT
        )
      `);
    }
    await client.query('COMMIT');
    console.log(`Table ${tableName} ensured.`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error creating table:", error);
    throw error;
  } finally {
    client.release();
  }
};

// Fetch product data dynamically
const fetchProductData = async (url: string, platform: string, apiKey?: string): Promise<ProductData[]> => {
  console.log(`Fetching product data from ${platform} at ${url}...`);
  if (platform === "opencart") return await fetchOpenCartData(url, apiKey);
  if (platform === "shopify") return await fetchShopifyData(url, apiKey);
  if (platform === "customstore") return await fetchCustomStoreData(url);
  throw new Error("Unsupported platform");
};

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

// Store products in PostgreSQL using table name based on API key
const storeProductData = async (products: ProductData[], apiKey: string) => {
  const sanitizedKey = sanitizeApiKey(apiKey);
  const productTableName = `${sanitizedKey}_productlist`;

  try {
    console.log("Ensuring product table exists...");
    await createTables(productTableName, true);

    const client = await pool.connect();

    try {
      // First clear existing data to ensure we don't have duplicates
      await client.query(`TRUNCATE TABLE ${productTableName}`);

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

        await client.query(
            `INSERT INTO ${productTableName} (
            vector, text, product_id, product_name, price, quantity, sku, model,
            image, category, url, availability, description_title,
            description_overview, description_details, description_specifications
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
            [
              JSON.stringify(vector), // Ensure your vector is in a proper format for pgvector
              product.description?.overview || "",
              product.id,
              product.name,
              product.price,
              product.quantity,
              product.sku,
              product.model,
              product.image,
              product.category,
              product.url,
              product.availability,
              product.description?.title,
              product.description?.overview,
              product.description?.details || "",
              product.description?.specifications || ""
            ]
        );
      }
      console.log("All products stored successfully!");
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error storing product data", error);
    throw error;
  }
};

// Store custom system prompt using table based on API key
const storeSystemPrompt = async (apiKey: string, customPrompt: string) => {
  const sanitizedKey = sanitizeApiKey(apiKey);
  const promptTableName = `${sanitizedKey}_prompt`;

  await createTables(promptTableName, false);
  const client = await pool.connect();
  try {
    await client.query(
        `INSERT INTO ${promptTableName} (id, content)
       VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET content = $2`,
        ["system_prompt", customPrompt]
    );
    console.log(`Stored custom prompt for API key: ${apiKey}`);

    // Also update the custom_prompt field in the chatbots table in chatbot_schema
    try {
      await client.query(
          `UPDATE chatbots SET custom_prompt = $1, updated_at = NOW() 
         WHERE api_key = $2`,
          [customPrompt, apiKey]
      );
      console.log(`Updated custom_prompt in chatbots table for API key: ${apiKey}`);
    } catch (error) {
      console.error(`Failed to update chatbots table: ${error}`);
      // Continue execution even if this fails - the prompt table update is the critical one
    }
  } finally {
    client.release();
  }
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

  // Verify the chatbot exists in the chatbots table
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
        `SELECT id FROM chatbots WHERE api_key = $1`,
        [apiKey]
    );

    if (rows.length === 0) {
      console.log(`Chatbot with API key ${apiKey} not found in the database. This might be a new configuration.`);
      // We'll still proceed with creating the product tables since this might be a new integration
    } else {
      console.log(`Found chatbot with API key ${apiKey} in the database.`);

      // Update the chatbot record with the latest information
      await client.query(
          `UPDATE chatbots SET 
         product_api_url = $1, 
         platform = $2,
         ${customPrompt ? 'custom_prompt = $3,' : ''} 
         updated_at = NOW() 
         WHERE api_key = $4`,
          customPrompt
              ? [productApiUrl, platform, customPrompt, apiKey]
              : [productApiUrl, platform, apiKey]
      );
      console.log(`Updated chatbot record with API key: ${apiKey}`);
    }
  } catch (error) {
    console.error(`Error checking chatbot existence: ${error}`);
    // Continue execution - the critical step is storing the product data
  } finally {
    client.release();
  }

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
  const promptTableName = `${sanitizedKey}_prompt`;
  const client = await pool.connect();
  try {
    // First ensure the prompt table exists
    await createTables(promptTableName, false);

    // Update the prompt in the dedicated prompt table
    await client.query(
        `INSERT INTO ${promptTableName} (id, content)
       VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET content = $2`,
        ["system_prompt", customPrompt]
    );

    // Also update the custom_prompt field in the chatbots table
    await client.query(
        `UPDATE chatbots SET custom_prompt = $1, updated_at = NOW() 
       WHERE api_key = $2`,
        [customPrompt, apiKey]
    );

    console.log(`Updated custom prompt for API key: ${apiKey}`);
  } catch (error: any) {
    console.error(`Error updating custom prompt: ${error.message}`);
    throw error;
  } finally {
    client.release();
  }
};