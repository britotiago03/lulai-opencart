-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the products table with vector support
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_model ON products(model);

-- Add vector similarity search index
CREATE INDEX IF NOT EXISTS products_embedding_idx ON products USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);

-- Create a table for API keys (optional, for future use)
CREATE TABLE IF NOT EXISTS api_keys (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Create a table for storing user sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  data JSONB
);

-- Create an index on sessions for faster lookups
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);