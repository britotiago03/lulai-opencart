-- lulai-chatbot/nextjs-chatbot/db/init.sql
CREATE EXTENSION IF NOT EXISTS vector;


CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  api_key VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  message_role VARCHAR(50) NOT NULL,
  message_content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);