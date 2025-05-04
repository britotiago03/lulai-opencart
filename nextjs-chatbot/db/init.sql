-- combined-init.sql

-- Create pgvector extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS vector;

-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
                                     id SERIAL PRIMARY KEY,
                                     name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'client',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Create chatbots table if not exists
CREATE TABLE IF NOT EXISTS chatbots (
                                        id SERIAL PRIMARY KEY,
                                        name VARCHAR(255) NOT NULL,
    description TEXT,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    industry VARCHAR(100),
    platform VARCHAR(100),
    product_api_url TEXT,
    custom_prompt TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Create widget_configs table if not exists
CREATE TABLE IF NOT EXISTS widget_configs (
                                              id SERIAL PRIMARY KEY,
                                              chatbot_id INTEGER REFERENCES chatbots(id),
    primary_color VARCHAR(20) DEFAULT '#007bff',
    secondary_color VARCHAR(20) DEFAULT '#e0f7fa',
    button_size INTEGER DEFAULT 60,
    window_width INTEGER DEFAULT 360,
    window_height INTEGER DEFAULT 500,
    header_text VARCHAR(100) DEFAULT 'Chat with us',
    font_family VARCHAR(255) DEFAULT 'Helvetica Neue, Helvetica, Arial, sans-serif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Create enhanced analytics table if not exists
CREATE TABLE IF NOT EXISTS analytics (
                                         id SERIAL PRIMARY KEY,
                                         chatbot_id INTEGER REFERENCES chatbots(id),
    conversation_count INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    avg_response_time FLOAT DEFAULT 0,
    conversion_rate FLOAT DEFAULT 0,
    cart_operation_count INTEGER DEFAULT 0,
    navigation_count INTEGER DEFAULT 0,
    question_count INTEGER DEFAULT 0,
    intent_distribution JSONB,
    top_products JSONB,
    metadata JSONB,
    time_range INTEGER DEFAULT 30,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Create conversations table if not exists (ensure it has metadata)
CREATE TABLE IF NOT EXISTS conversations (
                                             id SERIAL PRIMARY KEY,
                                             api_key VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    message_role VARCHAR(50) NOT NULL,
    message_content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    client_id VARCHAR(255)
    );

-- Create analytics_logs table to store snapshots of analytics data
CREATE TABLE IF NOT EXISTS analytics_logs (
                                              id SERIAL PRIMARY KEY,
                                              chatbot_id INTEGER REFERENCES chatbots(id),
    date DATE NOT NULL,
    conversation_count INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    cart_operations INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    conversion_rate FLOAT DEFAULT 0,
    avg_response_time FLOAT DEFAULT 0,
    intent_distribution JSONB,
    navigation_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Create an admin user for testing (password: adminPassword123)
INSERT INTO users (name, email, password, role)
VALUES ('Admin User', 'admin@lulai.com', '$2a$10$zqY1Cnn0N3WgRcbKAGXY8eq5o/DrkIJwFTjnzBwdEkYJ1j4v7Zmky', 'admin')
    ON CONFLICT (email) DO UPDATE SET password = '$2a$10$zqY1Cnn0N3WgRcbKAGXY8eq5o/DrkIJwFTjnzBwdEkYJ1j4v7Zmky';

-- Create a test client user (password: clientPassword123)
INSERT INTO users (name, email, password, role)
VALUES ('Test Client', 'client@example.com', '$2a$10$2hKGQ3JGVhyf0y1RWCGNJej5V/aJ2lGysJZKpOw2V0sMR/eELJmQW', 'client')
    ON CONFLICT (email) DO UPDATE SET password = '$2a$10$2hKGQ3JGVhyf0y1RWCGNJej5V/aJ2lGysJZKpOw2V0sMR/eELJmQW';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_api_key ON conversations(api_key);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_chatbots_user_id ON chatbots(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbots_api_key ON chatbots(api_key);

-- Create a GIN index on metadata for faster JSON queries
CREATE INDEX IF NOT EXISTS idx_conversations_metadata ON conversations USING GIN (metadata jsonb_path_ops);

-- Create a VIEW for easy access to intent distribution
CREATE OR REPLACE VIEW intent_distribution_view AS
SELECT
    c.api_key,
    cb.id as chatbot_id,
    metadata->>'intentAnalysis'->>'primaryIntent' as intent,
    COUNT(*) as count
FROM conversations c
    JOIN chatbots cb ON c.api_key = cb.api_key
WHERE metadata->>'intentAnalysis'->>'primaryIntent' IS NOT NULL
GROUP BY c.api_key, cb.id, metadata->>'intentAnalysis'->>'primaryIntent';

-- Create a VIEW for easy access to cart operations
CREATE OR REPLACE VIEW cart_operations_view AS
SELECT
    c.api_key,
    cb.id as chatbot_id,
    metadata->>'action'->>'operation' as operation,
    COUNT(*) as count
FROM conversations c
    JOIN chatbots cb ON c.api_key = cb.api_key
WHERE metadata->>'action'->>'type' = 'cart'
GROUP BY c.api_key, cb.id, metadata->>'action'->>'operation';

-- Create a function to update analytics table daily
CREATE OR REPLACE FUNCTION update_analytics_log()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update the analytics_log for the current date and chatbot
INSERT INTO analytics_logs (
    chatbot_id,
    date,
    conversation_count,
    message_count,
    cart_operations,
    conversions,
    conversion_rate,
    avg_response_time
)
SELECT
    NEW.chatbot_id,
    CURRENT_DATE,
    NEW.conversation_count,
    NEW.message_count,
    COALESCE((SELECT COUNT(*) FROM conversations c
                                       JOIN chatbots cb ON c.api_key = cb.api_key
              WHERE cb.id = NEW.chatbot_id
                AND c.metadata->>'action'->>'type' = 'cart'
            AND DATE(c.created_at) = CURRENT_DATE), 0),
    COALESCE((SELECT COUNT(*) FROM conversations c
                                       JOIN chatbots cb ON c.api_key = cb.api_key
              WHERE cb.id = NEW.chatbot_id
                AND c.metadata->>'action'->>'type' = 'cart'
            AND c.metadata->>'action'->>'operation' = 'add'
            AND DATE(c.created_at) = CURRENT_DATE), 0),
    NEW.conversion_rate,
    NEW.avg_response_time
    ON CONFLICT (chatbot_id, date)
    DO UPDATE SET
    conversation_count = EXCLUDED.conversation_count,
               message_count = EXCLUDED.message_count,
               cart_operations = EXCLUDED.cart_operations,
               conversions = EXCLUDED.conversions,
               conversion_rate = EXCLUDED.conversion_rate,
               avg_response_time = EXCLUDED.avg_response_time,
               created_at = NOW();

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update analytics_logs when analytics table is updated
CREATE TRIGGER trigger_update_analytics_log
    AFTER UPDATE ON analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_log();

-- Create a function to process conversation metadata and update analytics
CREATE OR REPLACE FUNCTION process_conversation_metadata()
RETURNS TRIGGER AS $$
BEGIN
    -- If the message is from assistant and contains action metadata, update analytics
    IF NEW.message_role = 'assistant' AND NEW.metadata IS NOT NULL THEN
        -- Find the chatbot for this API key
        DECLARE
chatbot_id_var INTEGER;
BEGIN
SELECT id INTO chatbot_id_var FROM chatbots WHERE api_key = NEW.api_key;

IF chatbot_id_var IS NOT NULL THEN
                -- Update the analytics table with new information
UPDATE analytics
SET
    message_count = message_count + 1,
    updated_at = NOW()
WHERE chatbot_id = chatbot_id_var;

-- If analytics record doesn't exist, create it
IF NOT FOUND THEN
                    INSERT INTO analytics (chatbot_id, message_count, updated_at)
                    VALUES (chatbot_id_var, 1, NOW());
END IF;

                -- If this message contains cart operation, update the cart_operation_count
                IF NEW.metadata->>'action'->>'type' = 'cart' THEN
UPDATE analytics
SET
    cart_operation_count = cart_operation_count + 1,
    updated_at = NOW()
WHERE chatbot_id = chatbot_id_var;
END IF;

                -- If this message contains navigation operation, update the navigation_count
                IF NEW.metadata->>'action'->>'type' = 'navigate' OR NEW.metadata->>'navigationAction'->>'type' = 'navigate' THEN
UPDATE analytics
SET
    navigation_count = navigation_count + 1,
    updated_at = NOW()
WHERE chatbot_id = chatbot_id_var;
END IF;
END IF;
END;
END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to process conversation metadata when a new conversation is inserted
CREATE TRIGGER trigger_process_conversation_metadata
    AFTER INSERT ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION process_conversation_metadata();