-- SQL Script with All Statements Commented Out

-- Create pgvector extension if it doesn't exist
-- CREATE EXTENSION IF NOT EXISTS vector;

-- Create users table if not exists
-- CREATE TABLE IF NOT EXISTS users (
--                                     id SERIAL PRIMARY KEY,
--                                     name VARCHAR(255) NOT NULL,
--     email VARCHAR(255) UNIQUE NOT NULL,
--     password VARCHAR(255) NOT NULL,
--     role VARCHAR(50) NOT NULL DEFAULT 'client',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--     );

-- Create chatbots table if not exists
-- CREATE TABLE IF NOT EXISTS chatbots (
--                                         id SERIAL PRIMARY KEY,
--                                         name VARCHAR(255) NOT NULL,
--     description TEXT,
--     api_key VARCHAR(255) UNIQUE NOT NULL,
--     industry VARCHAR(100),
--     platform VARCHAR(100),
--     product_api_url TEXT,
--     custom_prompt TEXT,
--     user_id INTEGER REFERENCES users(id),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--     );

-- Create widget_configs table if not exists
-- CREATE TABLE IF NOT EXISTS widget_configs (
--                                               id SERIAL PRIMARY KEY,
--                                               chatbot_id INTEGER REFERENCES chatbots(id),
--     primary_color VARCHAR(20) DEFAULT '#007bff',
--     secondary_color VARCHAR(20) DEFAULT '#e0f7fa',
--     button_size INTEGER DEFAULT 60,
--     window_width INTEGER DEFAULT 360,
--     window_height INTEGER DEFAULT 500,
--     header_text VARCHAR(100) DEFAULT 'Chat with us',
--     font_family VARCHAR(255) DEFAULT 'Helvetica Neue, Helvetica, Arial, sans-serif',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--     );

-- Create analytics table if not exists
-- CREATE TABLE IF NOT EXISTS analytics (
--                                          id SERIAL PRIMARY KEY,
--                                          chatbot_id INTEGER REFERENCES chatbots(id),
--     conversation_count INTEGER DEFAULT 0,
--     message_count INTEGER DEFAULT 0,
--     avg_response_time FLOAT DEFAULT 0,
--     conversion_rate FLOAT DEFAULT 0,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--     );

-- Create conversations table if not exists
-- CREATE TABLE IF NOT EXISTS conversations (
--                                              id SERIAL PRIMARY KEY,
--                                              api_key VARCHAR(255) NOT NULL,
--     user_id VARCHAR(255) NOT NULL,
--     message_role VARCHAR(50) NOT NULL,
--     message_content TEXT NOT NULL,
--     metadata JSONB,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--     );

-- Create subscriptions table if not exists
-- CREATE TABLE IF NOT EXISTS subscriptions (
--                                              id SERIAL PRIMARY KEY,
--                                              user_id INTEGER REFERENCES users(id),
--     plan_id VARCHAR(100) NOT NULL,
--     plan_name VARCHAR(100) NOT NULL,
--     price DECIMAL(10, 2) NOT NULL,
--     status VARCHAR(50) DEFAULT 'active',
--     current_period_start TIMESTAMP NOT NULL,
--     current_period_end TIMESTAMP NOT NULL,
--     cancel_at_period_end BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--     );

-- Create an admin user for testing (updated password hash for "adminPassword123")
-- INSERT INTO users (name, email, password, role)
-- VALUES ('Admin User', 'admin@lulai.com', '$2a$10$zqY1Cnn0N3WgRcbKAGXY8eq5o/DrkIJwFTjnzBwdEkYJ1j4v7Zmky', 'admin')
--     ON CONFLICT (email) DO NOTHING;

-- Create a test client user (password: clientPassword123)
-- INSERT INTO users (name, email, password, role)
-- VALUES ('Test Client', 'client@example.com', '$2a$10$2hKGQ3JGVhyf0y1RWCGNJej5V/aJ2lGysJZKpOw2V0sMR/eELJmQW', 'client')
--     ON CONFLICT (email) DO NOTHING;

-- Add indexes for better performance
-- CREATE INDEX IF NOT EXISTS idx_conversations_api_key ON conversations(api_key);
-- CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
-- CREATE INDEX IF NOT EXISTS idx_chatbots_user_id ON chatbots(user_id);
-- CREATE INDEX IF NOT EXISTS idx_chatbots_api_key ON chatbots(api_key);