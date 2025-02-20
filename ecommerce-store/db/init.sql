-- Ensure we are using the correct database
\c ecommerce_db;

-- Create tables only if they don’t exist
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cart (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  product_id INT REFERENCES products(id),
  quantity INT DEFAULT 1
);

-- Insert a sample product only if the table is empty
INSERT INTO products (name, description, price, image_url)
SELECT 'Test Product', 'This is a sample product', 19.99, 'https://via.placeholder.com/150'
WHERE NOT EXISTS (SELECT 1 FROM products);
