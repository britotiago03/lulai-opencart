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
    api_key VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserting admin users with hashed passwords and API keys
INSERT INTO users (name, email, password, is_admin, api_key) VALUES
('Admin User 1', 'admin1@example.com', '$2b$10$C2RZoMmZKZll7bOJO6lSROeBz3ntoNNABYiVA2y86/6kb1SmZTv9i', TRUE, 'admin1-api-key'),
('Admin User 2', 'admin2@example.com', '$2b$10$Ty8FytGEj581KECxNkMGUuyV6qMbALivQQ9aJPHSinUqqh3ksR2Y2', TRUE, 'admin2-api-key');

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

-- Create products table with JSON description file reference
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    images JSONB NOT NULL,
    description_file TEXT NOT NULL
);

-- Create cart table
CREATE TABLE cart (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    product_id INT REFERENCES products(id),
    quantity INT DEFAULT 1
);

-- Insert sample products with reference to JSON description files
INSERT INTO products (name, brand, price, images, description_file) VALUES
(
    'Canon EOS 5D',
    'Canon',
    98.00,
    '["/images/products/canon_eos_5d/canon_eos_5d_1.jpg", "/images/products/canon_eos_5d/canon_eos_5d_2.jpg", "/images/products/canon_eos_5d/canon_eos_5d_3.jpg"]',
    '/descriptions/canon_eos_5d.json'
),
(
    'HP LP3065 Monitor',
    'HP',
    122.00,
    '["/images/products/hp_lp3065/hp_lp3065_1.jpg", "/images/products/hp_lp3065/hp_lp3065_2.jpg", "/images/products/hp_lp3065/hp_lp3065_3.jpg"]',
    '/descriptions/hp_lp3065.json'
),
(
    'HTC Touch HD',
    'HTC',
    122.00,
    '["/images/products/htc_touch_hd/htc_touch_hd_1.jpg", "/images/products/htc_touch_hd/htc_touch_hd_2.jpg", "/images/products/htc_touch_hd/htc_touch_hd_3.jpg"]',
    '/descriptions/htc_touch_hd.json'
),
(
    'iMac',
    'Apple',
    122.00,
    '["/images/products/imac/imac_1.jpg", "/images/products/imac/imac_2.jpg", "/images/products/imac/imac_3.jpg"]',
    '/descriptions/imac.json'
),
(
    'iPhone',
    'Apple',
    123.20,
    '["/images/products/iphone/iphone_1.jpg", "/images/products/iphone/iphone_2.jpg",
    "/images/products/iphone/iphone_3.jpg", "/images/products/iphone/iphone_4.jpg",
    "/images/products/iphone/iphone_5.jpg", "/images/products/iphone/iphone_6.jpg"]',
    '/descriptions/iphone.json'
),
(
    'iPod Classic',
    'Apple',
    122.00,
    '["/images/products/ipod_classic/ipod_classic_1.jpg", "/images/products/ipod_classic/ipod_classic_2.jpg",
     "/images/products/ipod_classic/ipod_classic_3.jpg", "/images/products/ipod_classic/ipod_classic_4.jpg"]',
    '/descriptions/ipod_classic.json'
),
(
    'iPod Nano',
    'Apple',
    122.00,
    '["/images/products/ipod_nano/ipod_nano_1.jpg", "/images/products/ipod_nano/ipod_nano_2.jpg",
    "/images/products/ipod_nano/ipod_nano_3.jpg", "/images/products/ipod_nano/ipod_nano_4.jpg",
    "/images/products/ipod_nano/ipod_nano_5.jpg"]',
    '/descriptions/ipod_nano.json'
),
(
    'iPod Shuffle',
    'Apple',
    122.00,
    '["/images/products/ipod_shuffle/ipod_shuffle_1.jpg", "/images/products/ipod_shuffle/ipod_shuffle_2.jpg",
    "/images/products/ipod_shuffle/ipod_shuffle_3.jpg", "/images/products/ipod_shuffle/ipod_shuffle_4.jpg",
     "/images/products/ipod_shuffle/ipod_shuffle_5.jpg"]',
    '/descriptions/ipod_shuffle.json'
),
(
    'iPod Touch',
    'Apple',
    122.00,
    '["/images/products/ipod_touch/ipod_touch_1.jpg", "/images/products/ipod_touch/ipod_touch_2.jpg",
    "/images/products/ipod_touch/ipod_touch_3.jpg", "/images/products/ipod_touch/ipod_touch_4.jpg",
     "/images/products/ipod_touch/ipod_touch_5.jpg", "/images/products/ipod_touch/ipod_touch_6.jpg",
      "/images/products/ipod_touch/ipod_touch_7.jpg"]',
    '/descriptions/ipod_touch.json'
),
(
    'MacBook',
    'Apple',
    602.00,
    '["/images/products/macbook/macbook_1.jpg", "/images/products/macbook/macbook_2.jpg",
    "/images/products/macbook/macbook_3.jpg", "/images/products/macbook/macbook_4.jpg",
    "/images/products/macbook/macbook_5.jpg"]',
    '/descriptions/macbook.json'
),
(
    'MacBook Air',
    'Apple',
    1202.00,
    '["/images/products/macbook_air/macbook_air_1.jpg", "/images/products/macbook_air/macbook_air_2.jpg",
    "/images/products/macbook_air/macbook_air_3.jpg", "/images/products/macbook_air/macbook_air_4.jpg"]',
    '/descriptions/macbook_air.json'
),
(
    'MacBook Pro',
    'Apple',
    2000.00,
    '["/images/products/macbook_pro/macbook_pro_1.jpg", "/images/products/macbook_pro/macbook_pro_2.jpg",
    "/images/products/macbook_pro/macbook_pro_3.jpg", "/images/products/macbook_pro/macbook_pro_4.jpg"]',
    '/descriptions/macbook_pro.json'
),
(
    'Nikon D300',
    'Nikon',
    98.00,
    '["/images/products/nikon_d300/nikon_d300_1.jpg", "/images/products/nikon_d300/nikon_d300_2.jpg",
    "/images/products/nikon_d300/nikon_d300_3.jpg", "/images/products/nikon_d300/nikon_d300_4.jpg",
     "/images/products/nikon_d300/nikon_d300_5.jpg"]',
    '/descriptions/nikon_d300.json'
),
(
    'Palm Treo Pro',
    'Palm',
    337.99,
    '["/images/products/palm_treo_pro/palm_treo_pro_1.jpg", "/images/products/palm_treo_pro/palm_treo_pro_2.jpg",
    "/images/products/palm_treo_pro/palm_treo_pro_3.jpg"]',
    '/descriptions/palm_treo_pro.json'
),
(
    'Samsung Galaxy Tab 10.1',
    'Samsung',
    241.99,
    '["/images/products/samsung_tab/samsung_tab_1.jpg", "/images/products/samsung_tab/samsung_tab_2.jpg",
    "/images/products/samsung_tab/samsung_tab_3.jpg", "/images/products/samsung_tab/samsung_tab_4.jpg",
    "/images/products/samsung_tab/samsung_tab_5.jpg", "/images/products/samsung_tab/samsung_tab_6.jpg",
    "/images/products/samsung_tab/samsung_tab_7.jpg"]',
    '/descriptions/samsung_tab.json'
),
(
    'Sony VAIO',
    'Sony',
    1202.00,
    '["/images/products/sony_vaio/sony_vaio_1.jpg", "/images/products/sony_vaio/sony_vaio_2.jpg",
    "/images/products/sony_vaio/sony_vaio_3.jpg", "/images/products/sony_vaio/sony_vaio_4.jpg",
     "/images/products/sony_vaio/sony_vaio_5.jpg"]',
    '/descriptions/sony_vaio.json'
);

-- Add indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS sessions_token_idx ON sessions(session_token);
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS products_brand_idx ON products(brand);
