import { Pool } from "pg";
import "dotenv/config";
import OpenAI from "openai";
import fs from "fs";

// Load env variables
const DATABASE_URL = process.env.DATABASE_URL!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

if (!DATABASE_URL || !OPENAI_API_KEY) {
  throw new Error("Missing environment variables. Check your .env file.");
}

// Initialize DB Connection
const pool = new Pool({ connectionString: DATABASE_URL });

// OpenAI Client
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Define Product Data
export interface ProductData {
  id: string;
  name: string;
  price: string;
  sku: string;
  model: string;
  image: string;
  type: string;
  availability: string;
  currency: string;
  weightOrSize: string;
  origin: string;
  aisle: number;
}

// Define progress callback function type
type ProgressCallback = (progress: number, message?: string) => void;

// Default progress callback if none provided
const defaultProgressCallback: ProgressCallback = () => {};

// **📌 Create Table (Run Once)**
const setupDatabase = async (progressCallback: ProgressCallback = defaultProgressCallback) => {
  progressCallback(10, "Setting up database...");
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price TEXT,
        sku TEXT,
        model TEXT,
        image TEXT,
        type TEXT,
        availability TEXT,
        currency TEXT,
        weight_or_size TEXT,
        origin TEXT,
        aisle INT,
        embedding vector(1536)  -- Vector Search
      );
    `);
    progressCallback(20, "Database setup complete!");
  } finally {
    client.release();
  }
};

// **📌 Load Products from JSON**
const fetchProductDataFromJsonFile = async (
    filePath: string,
    progressCallback: ProgressCallback = defaultProgressCallback
): Promise<ProductData[]> => {
  progressCallback(25, "Loading product data from JSON file...");
  const rawData = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(rawData);

  progressCallback(30, "Processing product data...");
  return data.products.map((product: any) => ({
    id: product.productId,
    name: product.name,
    price: product.price?.amount || "0.00",
    sku: product.retailerProductId || "",
    model: product.brand || "",
    image: product.image?.src || "",
    type: product.type || "Unknown",
    availability: product.available ? "In Stock" : "Out of Stock",
    currency: product.price?.currency || "CAD",
    weightOrSize: product.packSizeDescription || "",
    origin: product.iconAttributes?.find((icon: any) => icon.label === "Shop Canada") ? "Canada" : "Other",
    aisle: Math.floor(Math.random() * 40) + 1,
  }));
};

// **📌 Format vector for pgvector**
const formatVectorForPgVector = (embedding: any): string => {
  if (Array.isArray(embedding)) {
    // If it's already an array, convert to pgvector format with square brackets
    return `[${embedding.join(',')}]`;
  } else if (typeof embedding === 'string') {
    if (embedding.startsWith('{') && embedding.endsWith('}')) {
      // Convert from {"0.1","0.2"} format to [0.1,0.2] format
      const content = embedding
          .substring(1, embedding.length - 1) // Remove outer braces
          .split(',')
          .map(val => val.replace(/"/g, '').trim()) // Remove quotes
          .join(',');

      return `[${content}]`;
    } else if (embedding.startsWith('[') && embedding.endsWith(']')) {
      // Already in correct format
      return embedding;
    }
  }

  // Fall back to an empty vector if format is unrecognized
  console.warn("Warning: Unrecognized embedding format. Using empty vector.");
  return '[]';
};

// **📌 Store Data in PostgreSQL**
const storeProductData = async (
    products: ProductData[],
    progressCallback: ProgressCallback = defaultProgressCallback
) => {
  progressCallback(35, "Storing product data in PostgreSQL...");

  const client = await pool.connect();
  try {
    const totalProducts = products.length;
    let processed = 0;

    for (const product of products) {
      try {
        // Generate embeddings for the product name
        const embeddings = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: product.name,
          encoding_format: "float",
        });

        // Format embedding in pgvector format
        const formattedEmbedding = formatVectorForPgVector(embeddings.data[0].embedding);

        await client.query(
            `INSERT INTO products (
            id, name, price, sku, model, image, type, availability, 
            currency, weight_or_size, origin, aisle, embedding
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, 
            $9, $10, $11, $12, $13
          ) ON CONFLICT (id) DO UPDATE SET
            name = $2,
            price = $3,
            sku = $4,
            model = $5,
            image = $6,
            type = $7,
            availability = $8,
            currency = $9,
            weight_or_size = $10,
            origin = $11,
            aisle = $12,
            embedding = $13;`,
            [
              product.id,
              product.name,
              product.price,
              product.sku,
              product.model,
              product.image,
              product.type,
              product.availability,
              product.currency,
              product.weightOrSize,
              product.origin,
              product.aisle,
              formattedEmbedding,
            ]
        );
      } catch (error) {
        console.error(`Error processing product ${product.id}:`, error);
        // Continue with next product instead of failing the entire batch
      }

      processed++;
      // Update progress based on percentage of products processed
      const progressPercentage = Math.floor(35 + (processed / totalProducts) * 60);
      progressCallback(progressPercentage, `Processed ${processed}/${totalProducts} products...`);
    }

    progressCallback(95, "Data stored successfully!");
  } finally {
    client.release();
  }
};

// **📌 Main Function**
export const loadProductDataFromJsonFile = async (
    filePath: string = "./response.json",
    progressCallback: ProgressCallback = defaultProgressCallback
) => {
  progressCallback(5, "Starting integration...");

  try {
    await setupDatabase(progressCallback);
    const products = await fetchProductDataFromJsonFile(filePath, progressCallback);

    if (products.length === 0) {
      progressCallback(0, "Error: No products found in file");
      return Promise.reject(new Error("No products found in file"));
    }

    await storeProductData(products, progressCallback);
    progressCallback(100, "Integration complete!");
    return { success: true, productCount: products.length };
  } catch (error) {
    console.error("Integration error:", error);
    progressCallback(0, `Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    throw error;
  }
};

// Run if executed directly
if (require.main === module) {
  loadProductDataFromJsonFile().catch(console.error);
}