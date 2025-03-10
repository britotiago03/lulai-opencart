-- Ensure we are using the correct database
\c ecommerce_db;

-- Drop existing tables if they exist (for clean initialization)
DROP TABLE IF EXISTS users, sessions, subscriptions, products, cart;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    subscription_status VARCHAR(50) DEFAULT 'free',
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserting admin users with hashed passwords and API keys
INSERT INTO users (name, email, password, is_admin, api_key) VALUES
('Admin User 1', 'admin1@example.com', '$2b$10$C2RZoMmZKZll7bOJO6lSROeBz3ntoNNABYiVA2y86/6kb1SmZTv9i', TRUE),
('Admin User 2', 'admin2@example.com', '$2b$10$Ty8FytGEj581KECxNkMGUuyV6qMbALivQQ9aJPHSinUqqh3ksR2Y2', TRUE);

-- Create sessions table
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriptions table
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    plan_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Add indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS sessions_token_idx ON sessions(session_token);
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);