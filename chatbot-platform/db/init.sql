\c chatbot;

DO $$ BEGIN
    RAISE NOTICE 'Creating users table...';
END $$;

-- CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'client',
    verified BOOLEAN DEFAULT FALSE,
    auth_provider VARCHAR(50),  -- 'email', 'google', etc.
    is_active BOOLEAN DEFAULT TRUE,
    subscription_status VARCHAR(50) DEFAULT 'none',
    subscription_renewal_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create verification_tokens table with updated user_id type
CREATE TABLE IF NOT EXISTS verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- Updated type
    token VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'email_verification' or 'email_change'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    new_email VARCHAR(255) NULL, -- Only used for email change
    UNIQUE(token)
);


CREATE TABLE IF NOT EXISTS chatbots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    industry VARCHAR(100),
    platform VARCHAR(100),
    product_api_url TEXT,
    custom_prompt TEXT,
    user_id VARCHAR(255) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    chatbot_id INTEGER REFERENCES chatbots(id),
    conversation_count INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    avg_response_time FLOAT DEFAULT 0,
    conversion_rate FLOAT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    api_key VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    message_role VARCHAR(50) NOT NULL,
    message_content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    user_email VARCHAR(255) REFERENCES users(email),
    plan_type VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    current_period_start TIMESTAMP NOT NULL,
    current_period_renewal TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table with updated user_id type
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),  -- Updated type
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create admin settings table (unchanged)
CREATE TABLE admin_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255) REFERENCES users(id)
);

-- Create table for secure admin access URLs (unchanged)
CREATE TABLE admin_access_tokens (
    id SERIAL PRIMARY KEY,
    url_path VARCHAR(255) NOT NULL,
    access_key VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by VARCHAR(255) REFERENCES users(id),
    last_used_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_api_key ON conversations(api_key);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbots_user_id ON chatbots(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbots_api_key ON chatbots(api_key);
-- Add indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS sessions_token_idx ON sessions(session_token);
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS verification_tokens_token_idx ON verification_tokens(token);
CREATE INDEX IF NOT EXISTS verification_tokens_user_id_idx ON verification_tokens(user_id);


-- Create a test client user (password: clientPassword123)
INSERT INTO users (id, name, email, password, role, verified)
VALUES ('1', 'Test Client', 'client@example.com', '$2b$10$5plODW9xBoXdp5TbETv2PemUBlisKmnaLfq.tiIApR513On3CO90e', 'client', true)
    ON CONFLICT (email) DO NOTHING;


-- Create an admin user for testing (updated password hash for "adminPassword123")
INSERT INTO users (id, name, email, password, role, verified)
VALUES ('2' ,'Admin User', 'admin@lulai.com', '$2a$10$zqY1Cnn0N3WgRcbKAGXY8eq5o/DrkIJwFTjnzBwdEkYJ1j4v7Zmky', 'admin', true)
    ON CONFLICT (email) DO NOTHING;

-- Insert default settings
INSERT INTO admin_settings (setting_key, setting_value)
VALUES
('access_token_renewal_frequency', 'weekly'),
('admin_email', 'boss2909@hotmail.com'),
('setup_completed', 'false');