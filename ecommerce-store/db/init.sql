-- Ensure we are using the correct database
\c ecommerce_db;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    subscription_status VARCHAR(50) DEFAULT 'free',
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'email_verification' or 'email_change'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    new_email VARCHAR(255) NULL, -- Only used for email change
    UNIQUE(token)
);

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
    category TEXT NOT NULL DEFAULT 'Uncategorized',
    price DOUBLE PRECISION NOT NULL,
    images JSONB NOT NULL,
    description_file TEXT NOT NULL
);

-- Create cart table
CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_id TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_details JSONB,
    shipping_amount DECIMAL(10, 2) NOT NULL DEFAULT 5.99,
    tax_amount DECIMAL(10, 2) NOT NULL,
    subtotal_amount DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create order items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create shipping addresses table
CREATE TABLE shipping_addresses (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample users (for reviews)
INSERT INTO users (name, email, password, verified) VALUES
('Alice Johnson', 'alice.johnson@example.com', '$2a$10$XoQH7Pv3KU3l5u1o4eGZ7eypwl7LrsYAGpH1iyA0Fk2kI8FfNoH2G', true), -- Password: alice123
('Bob Smith', 'bob.smith@example.com', '$2a$10$7c6n7yRTiX/i5pEwI9pTqe/jmP/dQ3hjOHjdp2BOU5Nz5fdP/zqXW', true), -- Password: bob123
('Charlie Davis', 'charlie.davis@example.com', '$2a$10$0/0Qs6Viuwm6VRmnqP.yJuCqFXV6cGklOQlWOS4W3CJzMzB5Xj2me', true), -- Password: charlie123
('David Lee', 'david.lee@example.com', '$2a$10$Hgf5Z4wOVHQUy7Hd1yJh4.k7fYlh8bn4XJX5IhiA5Th34oE3YgFAu', true), -- Password: david123
('Emma Watson', 'emma.watson@example.com', '$2a$10$Dqg.BgRrB2npLO6eE3aovujWZPML42wlpeogXXq23Q3t9KQ53JHBO', true), -- Password: emma123
('Sophia Martinez', 'sophia.martinez@example.com', '$2a$10$T39EopFhPZK6BlL3yP/ruObZ/NBOItDwmUyOZbH23Gx9pY0JwGaqO', true), -- Password: sophia123
('James Anderson', 'james.anderson@example.com', '$2a$10$W9yE5KhgXqMJr1X7zLp/7uV7Gp6lKqFtP3z6hYgfI1R.LCRUzBa0q', true), -- Password: james123
('Olivia Wilson', 'olivia.wilson@example.com', '$2a$10$VQaXqHn4Zf3W9mRU/4Bv5uswP84RH06KbOMyN.g5GH11yH.M3/Lsm', true), -- Password: olivia123
('Ethan Brown', 'ethan.brown@example.com', '$2a$10$XyZ7lF21B4S1HV6tIUZjNeRE0MvlV9U8XxXW.O3kg02LMQxzPi5Dq', true), -- Password: ethan123
('Mia Thomas', 'mia.thomas@example.com', '$2a$10$RyB81eH3OeZfpI17y6i9G.u43gkHLzwdPcRAf6Ky3XGBwzUojh50y', true), -- Password: mia123
('Liam Carter', 'liam.carter@example.com', '$2a$10$3K7d5kPZQmhf3N6vN6yfpOwG/zkBtZxOZ6WJ0Pfp1.TtN/L9M3BaW', true), -- Password: liam123
('Ava Robinson', 'ava.robinson@example.com', '$2a$10$K9Uz41MnqP6JW3B2vXv71uF4lq82Gy8XRz9HY6/LuOeF1/0T3G7Na', true), -- Password: ava123
('Noah Walker', 'noah.walker@example.com', '$2a$10$Xq82Rlfn6W39PTGQ8Bz5Mvg9LF4o7J/G8pON4KZ3FPLp6zN0qWzPY', true), -- Password: noah123
('Isabella Harris', 'isabella.harris@example.com', '$2a$10$72JrV5n2Rf41PTGQO7J6Mv9XN4o3YK/G87PL5QZ3FWXx8pL3TwNzQ', true), -- Password: isabella123
('William White', 'william.white@example.com', '$2a$10$Xq70RZfn2W36PTGQO7Bz4Mvg9LF4o7J/G89PL6KZ3FPWp5zN0YzPY', true), -- Password: william123
('Elijah Scott', 'elijah.scott@example.com', '$2a$10$XgF7nTQpR3K2LM9nWYJ4cLzQH8kTfO3BP9R5L6FQWNp7M0Z2YbVPa', true), -- Password: elijah123
('Amelia Adams', 'amelia.adams@example.com', '$2a$10$N5WQ72TPG3KLMO6n7YJQ8XcLZ9HPF4O3WBPR6F5VNp7M2Z0XbLVaY', true), -- Password: amelia123
('Lucas Mitchell', 'lucas.mitchell@example.com', '$2a$10$M4QW7TPG2KLMO5n8YJXQ9LZHPF3O3WBPR5F6VNP7M2Z0XbLVaYbT', true), -- Password: lucas123
('Harper Evans', 'harper.evans@example.com', '$2a$10$O3WQ7TPG2KLMN5YJXQ9LZHPF6V3O3WBPR5F7VNpM2Z0XbLVaYbLQ', true), -- Password: harper123
('Benjamin Flores', 'benjamin.flores@example.com', '$2a$10$N6WQ7TPG3KLMO2nYJXQ8LZHPF5O3WBPR4F7VNpM2Z0XbLVaYbLQX', true), -- Password: benjamin123
('Henry Parker', 'henry.parker@example.com', '$2a$10$XzT6nYQpL3WJ4K2MO9nFQ8bVZHPF5O3BR7VNpM2Xb0YLVaQb6TPW', true), -- Password: henry123
('Victoria Reed', 'victoria.reed@example.com', '$2a$10$N5WQ72TPG3KLMO6n7YJQ8XcLZ9HPF4O3WBPR6F5VNp7M2Z0XbLVaY', true), -- Password: victoria123
('Daniel Bennett', 'daniel.bennett@example.com', '$2a$10$M4QW7TPG2KLMO5n8YJXQ9LZHPF3O3WBPR5F6VNP7M2Z0XbLVaYbT', true), -- Password: daniel123
('Scarlett Fisher', 'scarlett.fisher@example.com', '$2a$10$O3WQ7TPG2KLMN5YJXQ9LZHPF6V3O3WBPR5F7VNpM2Z0XbLVaYbLQ', true), -- Password: scarlett123
('Matthew Collins', 'matthew.collins@example.com', '$2a$10$N6WQ7TPG3KLMO2nYJXQ8LZHPF5O3WBPR4F7VNpM2Z0XbLVaYbLQX', true), -- Password: matthew123
('Natalie Cooper', 'natalie.cooper@example.com', '$2a$10$XzT6nYQpL3WJ4K2MO9nFQ8bVZHPF5O3BR7VNpM2Xb0YLVaQb6TPW', true), -- Password: natalie123
('Samuel Turner', 'samuel.turner@example.com', '$2a$10$N5WQ72TPG3KLMO6n7YJQ8XcLZ9HPF4O3WBPR6F5VNp7M2Z0XbLVaY', true), -- Password: samuel123
('Hannah Brooks', 'hannah.brooks@example.com', '$2a$10$M4QW7TPG2KLMO5n8YJXQ9LZHPF3O3WBPR5F6VNP7M2Z0XbLVaYbT', true), -- Password: hannah123
('Jack Morgan', 'jack.morgan@example.com', '$2a$10$O3WQ7TPG2KLMN5YJXQ9LZHPF6V3O3WBPR5F7VNpM2Z0XbLVaYbLQ', true), -- Password: jack123
('Emily Foster', 'emily.foster@example.com', '$2a$10$N6WQ7TPG3KLMO2nYJXQ8LZHPF5O3WBPR4F7VNpM2Z0XbLVaYbLQX', true), -- Password: emily123
('Zachary Price', 'zachary.price@example.com', '$2a$10$XzT6nYQpL3WJ4K2MO9nFQ8bVZHPF5O3BR7VNpM2Xb0YLVaQb6TPW', true), -- Password: zachary123
('Madison Hayes', 'madison.hayes@example.com', '$2a$10$N5WQ72TPG3KLMO6n7YJQ8XcLZ9HPF4O3WBPR6F5VNp7M2Z0XbLVaY', true), -- Password: madison123
('Andrew Green', 'andrew.green@example.com', '$2a$10$M4QW7TPG2KLMO5n8YJXQ9LZHPF3O3WBPR5F6VNP7M2Z0XbLVaYbT', true), -- Password: andrew123
('Samantha Bell', 'samantha.bell@example.com', '$2a$10$O3WQ7TPG2KLMN5YJXQ9LZHPF6V3O3WBPR5F7VNpM2Z0XbLVaYbLQ', true), -- Password: samantha123
('Ethan Hall', 'ethan.hall@example.com', '$2a$10$N6WQ7TPG3KLMO2nYJXQ8LZHPF5O3WBPR4F7VNpM2Z0XbLVaYbLQX', true), -- Password: ethan123
('Brandon Lee', 'brandon.lee@example.com', '$2a$10$XzT6nYQpL3WJ4K2MO9nFQ8bVZHPF5O3BR7VNpM2Xb0YLVaQb6TPW', true), -- Password: brandon123
('Jessica Ward', 'jessica.ward@example.com', '$2a$10$N5WQ72TPG3KLMO6n7YJQ8XcLZ9HPF4O3WBPR6F5VNp7M2Z0XbLVaY', true), -- Password: jessica123
('Ryan Nelson', 'ryan.nelson@example.com', '$2a$10$M4QW7TPG2KLMO5n8YJXQ9LZHPF3O3WBPR5F6VNP7M2Z0XbLVaYbT', true), -- Password: ryan123
('Sophia Carter', 'sophia.carter@example.com', '$2a$10$O3WQ7TPG2KLMN5YJXQ9LZHPF6V3O3WBPR5F7VNpM2Z0XbLVaYbLQ', true), -- Password: sophia123
('Dylan Rivera', 'dylan.rivera@example.com', '$2a$10$N6WQ7TPG3KLMO2nYJXQ8LZHPF5O3WBPR4F7VNpM2Z0XbLVaYbLQX', true), -- Password: dylan123
('Logan Bennett', 'logan.bennett@example.com', '$2a$10$XzT6nYQpL3WJ4K2MO9nFQ8bVZHPF5O3BR7VNpM2Xb0YLVaQb6TPW', true), -- Password: logan123
('Grace Sullivan', 'grace.sullivan@example.com', '$2a$10$N5WQ72TPG3KLMO6n7YJQ8XcLZ9HPF4O3WBPR6F5VNp7M2Z0XbLVaY', true), -- Password: grace123
('Owen Patterson', 'owen.patterson@example.com', '$2a$10$M4QW7TPG2KLMO5n8YJXQ9LZHPF3O3WBPR5F6VNP7M2Z0XbLVaYbT', true), -- Password: owen123
('Lily Ramirez', 'lily.ramirez@example.com', '$2a$10$O3WQ7TPG2KLMN5YJXQ9LZHPF6V3O3WBPR5F7VNpM2Z0XbLVaYbLQ', true), -- Password: lily123
('Nathan Foster', 'nathan.foster@example.com', '$2a$10$N6WQ7TPG3KLMO2nYJXQ8LZHPF5O3WBPR4F7VNpM2Z0XbLVaYbLQX', true), -- Password: nathan123
('Hailey Ross', 'hailey.ross@example.com', '$2a$10$XzT6nYQpL3WJ4K2MO9nFQ8bVZHPF5O3BR7VNpM2Xb0YLVaQb6TPW', true), -- Password: hailey123
('Mason Kelly', 'mason.kelly@example.com', '$2a$10$N5WQ72TPG3KLMO6n7YJQ8XcLZ9HPF4O3WBPR6F5VNp7M2Z0XbLVaY', true), -- Password: mason123
('Avery Diaz', 'avery.diaz@example.com', '$2a$10$M4QW7TPG2KLMO5n8YJXQ9LZHPF3O3WBPR5F6VNP7M2Z0XbLVaYbT', true), -- Password: avery123
('Sebastian Cooper', 'sebastian.cooper@example.com', '$2a$10$O3WQ7TPG2KLMN5YJXQ9LZHPF6V3O3WBPR5F7VNpM2Z0XbLVaYbLQ', true), -- Password: sebastian123
('Ella Rivera', 'ella.rivera@example.com', '$2a$10$N6WQ7TPG3KLMO2nYJXQ8LZHPF5O3WBPR4F7VNpM2Z0XbLVaYbLQX', true), -- Password: ella123
('Eli Thompson', 'eli.thompson@example.com', '$2a$10$XzT6nYQpL3WJ4K2MO9nFQ8bVZHPF5O3BR7VNpM2Xb0YLVaQb6TPW', true), -- Password: eli123
('Layla Hughes', 'layla.hughes@example.com', '$2a$10$N5WQ72TPG3KLMO6n7YJQ8XcLZ9HPF4O3WBPR6F5VNp7M2Z0XbLVaY', true), -- Password: layla123
('Isaac Morgan', 'isaac.morgan@example.com', '$2a$10$M4QW7TPG2KLMO5n8YJXQ9LZHPF3O3WBPR5F6VNP7M2Z0XbLVaYbT', true), -- Password: isaac123
('Zoe Ramirez', 'zoe.ramirez@example.com', '$2a$10$O3WQ7TPG2KLMN5YJXQ9LZHPF6V3O3WBPR5F7VNpM2Z0XbLVaYbLQ', true), -- Password: zoe123
('Lucas Bennett', 'lucas.bennett@example.com', '$2a$10$N6WQ7TPG3KLMO2nYJXQ8LZHPF5O3WBPR4F7VNpM2Z0XbLVaYbLQX', true), -- Password: lucas123
('Adam Carter', 'adam.carter@example.com', '$2a$10$XzT6nYQpL3WJ4K2MO9nFQ8bVZHPF5O3BR7VNpM2Xb0YLVaQb6TPW', true), -- Password: adam123
('Chloe Sanders', 'chloe.sanders@example.com', '$2a$10$N5WQ72TPG3KLMO6n7YJQ8XcLZ9HPF4O3WBPR6F5VNp7M2Z0XbLVaY', true), -- Password: chloe123
('Jonathan Reed', 'jonathan.reed@example.com', '$2a$10$M4QW7TPG2KLMO5n8YJXQ9LZHPF3O3WBPR5F6VNP7M2Z0XbLVaYbT', true), -- Password: jonathan123
('Ariana Mitchell', 'ariana.mitchell@example.com', '$2a$10$O3WQ7TPG2KLMN5YJXQ9LZHPF6V3O3WBPR5F7VNpM2Z0XbLVaYbLQ', true), -- Password: ariana123
('Derek Foster', 'derek.foster@example.com', '$2a$10$N6WQ7TPG3KLMO2nYJXQ8LZHPF5O3WBPR4F7VNpM2Z0XbLVaYbLQX', true), -- Password: derek123
('Evan Parker', 'evan.parker@example.com', '$2a$10$XzT6nYQpL3WJ4K2MO9nFQ8bVZHPF5O3BR7VNpM2Xb0YLVaQb6TPW', true), -- Password: evan123
('Bella Morris', 'bella.morris@example.com', '$2a$10$N5WQ72TPG3KLMO6n7YJQ8XcLZ9HPF4O3WBPR6F5VNp7M2Z0XbLVaY', true), -- Password: bella123
('Aaron Phillips', 'aaron.phillips@example.com', '$2a$10$M4QW7TPG2KLMO5n8YJXQ9LZHPF3O3WBPR5F6VNP7M2Z0XbLVaYbT', true), -- Password: aaron123
('Isla Stewart', 'isla.stewart@example.com', '$2a$10$O3WQ7TPG2KLMN5YJXQ9LZHPF6V3O3WBPR5F7VNpM2Z0XbLVaYbLQ', true), -- Password: isla123
('Connor Evans', 'connor.evans@example.com', '$2a$10$N6WQ7TPG3KLMO2nYJXQ8LZHPF5O3WBPR4F7VNpM2Z0XbLVaYbLQX', true), -- Password: connor123
('Daniel Scott', 'daniel.scott@example.com', '$2a$10$XzT6nYQpL3WJ4K2MO9nFQ8bVZHPF5O3BR7VNpM2Xb0YLVaQb6TPW', true), -- Password: daniel123
('Olivia Carter', 'olivia.carter@example.com', '$2a$10$N5WQ72TPG3KLMO6n7YJQ8XcLZ9HPF4O3WBPR6F5VNp7M2Z0XbLVaY', true), -- Password: olivia123
('Benjamin Harris', 'benjamin.harris@example.com', '$2a$10$M4QW7TPG2KLMO5n8YJXQ9LZHPF3O3WBPR5F6VNP7M2Z0XbLVaYbT', true), -- Password: benjamin123
('Sophia Mitchell', 'sophia.mitchell@example.com', '$2a$10$O3WQ7TPG2KLMN5YJXQ9LZHPF6V3O3WBPR5F7VNpM2Z0XbLVaYbLQ', true), -- Password: sophia123
('Liam Cooper', 'liam.cooper@example.com', '$2a$10$N6WQ7TPG3KLMO2nYJXQ8LZHPF5O3WBPR4F7VNpM2Z0XbLVaYbLQX', true), -- Password: liam123
('Ethan Reynolds', 'ethan.reynolds@example.com', '$2a$10$XzT6nYQpL3WJ4K2MO9nFQ8bVZHPF5O3BR7VNpM2Xb0YLVaQb6TPW', true), -- Password: ethan123
('Mia Sullivan', 'mia.sullivan@example.com', '$2a$10$N5WQ72TPG3KLMO6n7YJQ8XcLZ9HPF4O3WBPR6F5VNp7M2Z0XbLVaY', true), -- Password: mia123
('Noah Brooks', 'noah.brooks@example.com', '$2a$10$M4QW7TPG2KLMO5n8YJXQ9LZHPF3O3WBPR5F6VNP7M2Z0XbLVaYbT', true), -- Password: noah123
('Isabella Foster', 'isabella.foster@example.com', '$2a$10$O3WQ7TPG2KLMN5YJXQ9LZHPF6V3O3WBPR5F7VNpM2Z0XbLVaYbLQ', true), -- Password: isabella123
('James Collins', 'james.collins@example.com', '$2a$10$N6WQ7TPG3KLMO2nYJXQ8LZHPF5O3WBPR4F7VNpM2Z0XbLVaYbLQX', true); -- Password: james123

-- Insert sample products with reference to JSON description files
INSERT INTO products (name, brand, category, price, images, description_file) VALUES
(
    'Canon EOS 5D',
    'Canon',
    'Cameras',
    98.00,
    '["/images/products/canon_eos_5d/canon_eos_5d_1.jpg", "/images/products/canon_eos_5d/canon_eos_5d_2.jpg", "/images/products/canon_eos_5d/canon_eos_5d_3.jpg"]',
    '/descriptions/canon_eos_5d.json'
),
(
    'HTC Touch HD',
    'HTC',
    'Smartphones',
    122.00,
    '["/images/products/htc_touch_hd/htc_touch_hd_1.jpg", "/images/products/htc_touch_hd/htc_touch_hd_2.jpg", "/images/products/htc_touch_hd/htc_touch_hd_3.jpg"]',
    '/descriptions/htc_touch_hd.json'
),
(
    'iMac',
    'Apple',
    'Computers',
    122.00,
    '["/images/products/imac/imac_1.jpg", "/images/products/imac/imac_2.jpg", "/images/products/imac/imac_3.jpg"]',
    '/descriptions/imac.json'
),
(
    'iPhone',
    'Apple',
    'Smartphones',
    123.20,
    '["/images/products/iphone/iphone_1.jpg", "/images/products/iphone/iphone_2.jpg",
    "/images/products/iphone/iphone_3.jpg", "/images/products/iphone/iphone_4.jpg",
    "/images/products/iphone/iphone_5.jpg", "/images/products/iphone/iphone_6.jpg"]',
    '/descriptions/iphone.json'
),
(
    'iPod Classic',
    'Apple',
    'Audio',
    122.00,
    '["/images/products/ipod_classic/ipod_classic_1.jpg", "/images/products/ipod_classic/ipod_classic_2.jpg",
     "/images/products/ipod_classic/ipod_classic_3.jpg", "/images/products/ipod_classic/ipod_classic_4.jpg"]',
    '/descriptions/ipod_classic.json'
),
(
    'iPod Nano',
    'Apple',
    'Audio',
    122.00,
    '["/images/products/ipod_nano/ipod_nano_1.jpg", "/images/products/ipod_nano/ipod_nano_2.jpg",
    "/images/products/ipod_nano/ipod_nano_3.jpg", "/images/products/ipod_nano/ipod_nano_4.jpg",
    "/images/products/ipod_nano/ipod_nano_5.jpg"]',
    '/descriptions/ipod_nano.json'
),
(
    'iPod Shuffle',
    'Apple',
    'Audio',
    122.00,
    '["/images/products/ipod_shuffle/ipod_shuffle_1.jpg", "/images/products/ipod_shuffle/ipod_shuffle_2.jpg",
    "/images/products/ipod_shuffle/ipod_shuffle_3.jpg", "/images/products/ipod_shuffle/ipod_shuffle_4.jpg",
     "/images/products/ipod_shuffle/ipod_shuffle_5.jpg"]',
    '/descriptions/ipod_shuffle.json'
),
(
    'iPod Touch',
    'Apple',
    'Audio',
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
    'Laptops',
    602.00,
    '["/images/products/macbook/macbook_1.jpg", "/images/products/macbook/macbook_2.jpg",
    "/images/products/macbook/macbook_3.jpg", "/images/products/macbook/macbook_4.jpg",
    "/images/products/macbook/macbook_5.jpg"]',
    '/descriptions/macbook.json'
),
(
    'MacBook Air',
    'Apple',
    'Laptops',
    1202.00,
    '["/images/products/macbook_air/macbook_air_1.jpg", "/images/products/macbook_air/macbook_air_2.jpg",
    "/images/products/macbook_air/macbook_air_3.jpg", "/images/products/macbook_air/macbook_air_4.jpg"]',
    '/descriptions/macbook_air.json'
),
(
    'MacBook Pro',
    'Apple',
    'Laptops',
    2000.00,
    '["/images/products/macbook_pro/macbook_pro_1.jpg", "/images/products/macbook_pro/macbook_pro_2.jpg",
    "/images/products/macbook_pro/macbook_pro_3.jpg", "/images/products/macbook_pro/macbook_pro_4.jpg"]',
    '/descriptions/macbook_pro.json'
),
(
    'Nikon D300',
    'Nikon',
    'Cameras',
    98.00,
    '["/images/products/nikon_d300/nikon_d300_1.jpg", "/images/products/nikon_d300/nikon_d300_2.jpg",
    "/images/products/nikon_d300/nikon_d300_3.jpg", "/images/products/nikon_d300/nikon_d300_4.jpg",
     "/images/products/nikon_d300/nikon_d300_5.jpg"]',
    '/descriptions/nikon_d300.json'
),
(
    'Palm Treo Pro',
    'Palm',
    'Smartphones',
    337.99,
    '["/images/products/palm_treo_pro/palm_treo_pro_1.jpg", "/images/products/palm_treo_pro/palm_treo_pro_2.jpg",
    "/images/products/palm_treo_pro/palm_treo_pro_3.jpg"]',
    '/descriptions/palm_treo_pro.json'
),
(
    'Samsung Galaxy Tab 10.1',
    'Samsung',
    'Tablets',
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
    'Laptops',
    1202.00,
    '["/images/products/sony_vaio/sony_vaio_1.jpg", "/images/products/sony_vaio/sony_vaio_2.jpg",
    "/images/products/sony_vaio/sony_vaio_3.jpg", "/images/products/sony_vaio/sony_vaio_4.jpg",
     "/images/products/sony_vaio/sony_vaio_5.jpg"]',
    '/descriptions/sony_vaio.json'
);

-- Insert sample reviews
INSERT INTO reviews (product_id, user_id, rating, comment) VALUES
-- Canon EOS 5D Reviews
(1, 1, 5, 'Fantastic camera, highly recommend!'),
(1, 2, 4, 'Great quality but a bit pricey.'),
(1, 3, 3, 'Good, but I wish it had better battery life.'),
(1, 4, 5, 'Incredible image quality!'),
(1, 5, 4, 'Solid build and excellent performance.'),

-- HTC Touch HD Reviews
(2, 6, 4, 'Really smooth interface, but the battery drains quickly.'),
(2, 7, 5, 'Love the display and touchscreen response!'),
(2, 8, 2, 'Too slow for my needs. Expected better performance.'),
(2, 9, 3, 'Decent phone, but lacks key modern features.'),
(2, 10, 4, 'Great value for the price! Lightweight and easy to use.'),

-- iMac Reviews
(3, 11, 5, 'Perfect for my video editing and graphic design work!'),
(3, 12, 4, 'The performance is fantastic, but it is a bit expensive.'),
(3, 13, 3, 'Great display, but I wish it had more upgrade options.'),
(3, 14, 5, 'Absolutely love the Retina screen and smooth performance!'),
(3, 15, 4, 'A solid desktop, but I miss having more ports.'),

-- iPod Classic Reviews
(5, 16, 5, 'The best MP3 player ever! Battery lasts forever and the sound is amazing.'),
(5, 17, 4, 'Classic design and great storage, but I wish it had Bluetooth.'),
(5, 18, 3, 'Still works well, but modern devices have better features.'),
(5, 19, 5, 'Brings back so many memories! Love using it for long trips.'),
(5, 20, 4, 'Solid build, great for audiophiles, but the click wheel takes some getting used to.'),

-- iPod Nano Reviews
(6, 21, 5, 'Perfect size for workouts! Lightweight and easy to carry.'),
(6, 22, 4, 'Love the compact design, but the screen could be bigger.'),
(6, 23, 3, 'Good MP3 player, but modern streaming services make it less useful.'),
(6, 24, 5, 'Battery life is amazing, and the sound quality is great.'),
(6, 25, 4, 'Still a great device for offline music lovers!'),

-- iPod Shuffle Reviews
(7, 26, 5, 'Super lightweight and perfect for jogging.'),
(7, 27, 4, 'Great for workouts, but I miss having a screen.'),
(7, 28, 3, 'Simple design, but I prefer something with more controls.'),
(7, 29, 5, 'Love the clip-on design! No worries about dropping it.'),
(7, 30, 4, 'Still the best choice for people who just want music on the go.'),

-- iPod Touch Reviews
(8, 31, 5, 'Great device for kids! They can use apps without a phone plan.'),
(8, 32, 4, 'Love the design, but I wish it had Face ID.'),
(8, 33, 3, 'Good for music and light gaming, but the battery drains quickly.'),
(8, 34, 5, 'Best alternative to an iPhone if you just need Wi-Fi!'),
(8, 35, 4, 'A solid media player, but I wish Apple still supported updates.'),

-- iPhone Reviews
(4, 36, 5, 'The best smartphone on the market! Fast and reliable.'),
(4, 37, 4, 'Excellent camera, but I wish the battery lasted longer.'),
(4, 38, 3, 'Good design, but I miss the headphone jack.'),
(4, 39, 5, 'iOS is smooth, and the ecosystem is unmatched!'),
(4, 40, 4, 'Great phone, but expensive compared to the competition.'),

-- MacBook Reviews
(9, 41, 5, 'Super lightweight and the battery lasts all day. Perfect for travel.'),
(9, 42, 4, 'The Retina display is stunning, but the keyboard feels a bit fragile.'),
(9, 43, 3, 'A decent laptop, but wish there were more ports.'),
(9, 44, 5, 'The best MacBook yet! Performance is fast and smooth.'),
(9, 45, 4, 'Great design and build quality, but I miss the older MagSafe charger.'),

-- MacBook Air Reviews
(10, 46, 5, 'Super lightweight and portable, perfect for students and travel.'),
(10, 47, 4, 'Battery life is incredible, but wish it had more ports.'),
(10, 48, 3, 'A good laptop, but struggles with heavy tasks like video editing.'),
(10, 49, 5, 'M1 chip makes it super fast and quiet, love the fanless design!'),
(10, 50, 4, 'Great screen and performance, but I miss the glowing Apple logo.'),

-- MacBook Pro Reviews
(11, 51, 5, 'The best laptop I have ever used. Perfect for professional work.'),
(11, 52, 4, 'Great power and performance, but a little on the heavy side.'),
(11, 53, 3, 'Love the display, but I wish it had more USB-A ports.'),
(11, 54, 5, 'M1 Pro chip is a game-changer! Runs super fast and efficiently.'),
(11, 55, 4, 'The battery life is incredible, but I still miss the Touch Bar.'),

-- Nikon D300 Reviews
(12, 56, 5, 'Excellent camera for professional photography! Amazing image quality.'),
(12, 57, 4, 'Great dynamic range, but I wish it had better low-light performance.'),
(12, 58, 3, 'Solid build and good ergonomics, but a bit outdated compared to newer models.'),
(12, 59, 5, 'Incredible autofocus system and great for action shots!'),
(12, 60, 4, 'A workhorse DSLR, but I miss built-in WiFi for quick transfers.'),

-- Palm Treo Pro Reviews
(13, 61, 5, 'A nostalgic device! Love the physical keyboard and stylus support.'),
(13, 62, 4, 'Great for business use back in the day, but lacking modern features.'),
(13, 63, 3, 'Battery life is solid, but the OS feels outdated now.'),
(13, 64, 5, 'Still a great backup phone for simple tasks and calls.'),
(13, 65, 4, 'Miss the days of Palm OS, but it struggles with modern apps.'),

-- Samsung Galaxy Tab 10.1 Reviews
(14, 66, 5, 'Perfect for media consumption! Great screen and battery life.'),
(14, 67, 4, 'Decent performance, but a bit slow compared to newer tablets.'),
(14, 68, 3, 'Solid build quality, but I wish it had more software updates.'),
(14, 69, 5, 'Fantastic tablet for reading and web browsing!'),
(14, 70, 4, 'Good value for the price, but the camera quality is just okay.'),

-- Sony VAIO Reviews
(15, 71, 5, 'A powerful laptop with a premium design, perfect for work and study.'),
(15, 72, 4, 'Great display and keyboard, but could use a better battery life.'),
(15, 73, 3, 'Decent performance, but the laptop gets hot under heavy use.'),
(15, 74, 5, 'Sony VAIO never disappoints! Sleek and durable build.'),
(15, 75, 4, 'Good overall, but I wish it had better cooling and upgrade options.');

-- Insert sample orders
INSERT INTO orders (user_id, status, payment_method, payment_status, payment_details, shipping_amount, tax_amount, subtotal_amount, total_amount) VALUES
-- User 1 orders
(1, 'completed', 'stripe', 'paid',
 '{"cardLast4": "4242", "cardholderName": "Alice Johnson"}',
 5.99, 24.40, 305.00, 335.39),

(1, 'processing', 'paypal', 'paid',
 '{"email": "alice.johnson@example.com"}',
 5.99, 40.00, 500.00, 545.99),

-- User 2 orders
(2, 'pending', 'manual', 'pending',
 '{"manualMethod": "bank_transfer", "notes": "Will transfer funds tomorrow"}',
 5.99, 96.16, 1202.00, 1304.15),

-- User 3 orders
(3, 'completed', 'stripe', 'paid',
 '{"cardLast4": "1234", "cardholderName": "Charlie Davis"}',
 5.99, 19.36, 242.00, 267.35),

-- User 4 orders with different statuses
(4, 'shipped', 'paypal', 'paid',
 '{"email": "david.lee@example.com"}',
 5.99, 48.16, 602.00, 656.15),

(4, 'cancelled', 'stripe', 'refunded',
 '{"cardLast4": "5678", "cardholderName": "David Lee"}',
 5.99, 160.00, 2000.00, 2165.99);

-- Insert sample shipping addresses for the orders
INSERT INTO shipping_addresses (order_id, first_name, last_name, email, phone, address, city, state, zip_code, country) VALUES
(1, 'Alice', 'Johnson', 'alice.johnson@example.com', '(555) 123-4567', '123 Main St', 'San Francisco', 'CA', '94105', 'US'),
(2, 'Alice', 'Johnson', 'alice.johnson@example.com', '(555) 123-4567', '123 Main St', 'San Francisco', 'CA', '94105', 'US'),
(3, 'Bob', 'Smith', 'bob.smith@example.com', '(555) 234-5678', '456 Oak Ave', 'New York', 'NY', '10001', 'US'),
(4, 'Charlie', 'Davis', 'charlie.davis@example.com', '(555) 345-6789', '789 Pine St', 'Chicago', 'IL', '60601', 'US'),
(5, 'David', 'Lee', 'david.lee@example.com', '(555) 456-7890', '1010 Maple Rd', 'Seattle', 'WA', '98101', 'US'),
(6, 'David', 'Lee', 'david.lee@example.com', '(555) 456-7890', '1010 Maple Rd', 'Seattle', 'WA', '98101', 'US');

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, quantity, price, total) VALUES
-- Order 1 items (Apple iPhone and HTC Touch HD)
(1, 4, 1, 123.20, 123.20), -- iPhone
(1, 2, 1, 122.00, 122.00), -- HTC Touch HD
(1, 8, 1, 59.80, 59.80),   -- iPod Touch

-- Order 2 items (Apple MacBook)
(2, 9, 1, 602.00, 602.00), -- MacBook

-- Order 3 items (MacBook Pro)
(3, 11, 1, 2000.00, 2000.00), -- MacBook Pro

-- Order 4 items (Samsung Galaxy Tab)
(4, 14, 1, 241.99, 241.99), -- Samsung Galaxy Tab

-- Order 5 items (MacBook Air)
(5, 10, 1, 1202.00, 1202.00), -- MacBook Air

-- Order 6 items (MacBook Pro - Cancelled order)
(6, 11, 1, 2000.00, 2000.00); -- MacBook Pro

-- Add indexes
CREATE INDEX users_email_idx ON users(email);
CREATE INDEX sessions_token_idx ON sessions(session_token);
CREATE INDEX subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX products_brand_idx ON products(brand);
CREATE INDEX products_category_idx ON products(category);
CREATE INDEX products_price_idx ON products(price);
CREATE INDEX products_name_idx ON products(name);
CREATE INDEX reviews_product_idx ON reviews(product_id);
CREATE INDEX reviews_user_idx ON reviews(user_id);
CREATE INDEX carts_user_id_idx ON carts(user_id);
CREATE INDEX carts_session_id_idx ON carts(session_id);
CREATE INDEX cart_items_cart_id_idx ON cart_items(cart_id);
CREATE INDEX cart_items_product_id_idx ON cart_items(product_id);
CREATE INDEX orders_user_id_idx ON orders(user_id);
CREATE INDEX orders_session_id_idx ON orders(session_id);
CREATE INDEX orders_status_idx ON orders(status);
CREATE INDEX orders_payment_status_idx ON orders(payment_status);
CREATE INDEX order_items_order_id_idx ON order_items(order_id);
CREATE INDEX order_items_product_id_idx ON order_items(product_id);
CREATE INDEX shipping_addresses_order_id_idx ON shipping_addresses(order_id);
CREATE INDEX verification_tokens_token_idx ON verification_tokens(token);
CREATE INDEX verification_tokens_user_id_idx ON verification_tokens(user_id);