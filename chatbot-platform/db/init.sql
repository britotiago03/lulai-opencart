-- Ensure we are using the correct database
\c chatbot_platform_db;

-- Drop existing tables if they exist (for clean initialization)
DROP TABLE IF EXISTS chatbots, chatbot_responses, chatbot_templates, industries;

-- Create industries table
CREATE TABLE industries (
                            id SERIAL PRIMARY KEY,
                            name VARCHAR(50) UNIQUE NOT NULL,
                            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create chatbot_templates table
CREATE TABLE chatbot_templates (
                                   id SERIAL PRIMARY KEY,
                                   name VARCHAR(255) NOT NULL,
                                   industry_id INTEGER REFERENCES industries(id),
                                   description TEXT,
                                   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create chatbots table
CREATE TABLE chatbots (
                          id SERIAL PRIMARY KEY,
                          name VARCHAR(255) NOT NULL,
                          description TEXT,
                          industry_id INTEGER REFERENCES industries(id),
                          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create chatbot_responses table
CREATE TABLE chatbot_responses (
                                   id SERIAL PRIMARY KEY,
                                   chatbot_id INTEGER REFERENCES chatbots(id) ON DELETE CASCADE,
                                   template_id INTEGER REFERENCES chatbot_templates(id) NULL,
                                   trigger_phrase TEXT NOT NULL,
                                   response_text TEXT NOT NULL,
                                   is_ai_enhanced BOOLEAN DEFAULT FALSE,
                                   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                   updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert standard industries
INSERT INTO industries (name) VALUES
                                  ('general'),
                                  ('fashion'),
                                  ('electronics'),
                                  ('food'),
                                  ('beauty');

-- Insert template data for each industry
-- General templates
INSERT INTO chatbot_templates (name, industry_id, description)
VALUES ('General Business',
        (SELECT id FROM industries WHERE name = 'general'),
        'Basic template suitable for any business with standard customer service responses.');

-- Fashion templates
INSERT INTO chatbot_templates (name, industry_id, description)
VALUES ('Fashion Retail',
        (SELECT id FROM industries WHERE name = 'fashion'),
        'Template for fashion stores with common questions about sizing, materials, and returns.');

-- Electronics templates
INSERT INTO chatbot_templates (name, industry_id, description)
VALUES ('Electronics Store',
        (SELECT id FROM industries WHERE name = 'electronics'),
        'Template for electronics stores with technical support, warranty, and compatibility questions.');

-- Food templates
INSERT INTO chatbot_templates (name, industry_id, description)
VALUES ('Food & Restaurant',
        (SELECT id FROM industries WHERE name = 'food'),
        'Template for food-related businesses with answers about ingredients, allergens, and ordering.');

-- Beauty templates
INSERT INTO chatbot_templates (name, industry_id, description)
VALUES ('Beauty & Cosmetics',
        (SELECT id FROM industries WHERE name = 'beauty'),
        'Template for beauty stores with responses about ingredients, testing, and product recommendations.');

-- Add template responses for General template
DO $$
DECLARE
template_id INTEGER;
BEGIN
SELECT id INTO template_id FROM chatbot_templates WHERE name = 'General Business';

INSERT INTO chatbot_responses (template_id, trigger_phrase, response_text, is_ai_enhanced) VALUES
                                                                                               (template_id, 'business hours', 'Our standard business hours are Monday to Friday, 9 AM to 5 PM.', FALSE),
                                                                                               (template_id, 'contact', 'You can reach our customer service team at support@example.com or call us at (123) 456-7890.', FALSE),
                                                                                               (template_id, 'help', 'I can help with various topics! Just ask about our products, services, or general information.', TRUE);
END $$;

-- Add template responses for Fashion template
DO $$
DECLARE
template_id INTEGER;
BEGIN
SELECT id INTO template_id FROM chatbot_templates WHERE name = 'Fashion Retail';

INSERT INTO chatbot_responses (template_id, trigger_phrase, response_text, is_ai_enhanced) VALUES
                                                                                               (template_id, 'size guide', 'You can find our size guide on the product page. We recommend measuring yourself and comparing with our size chart for the best fit.', FALSE),
                                                                                               (template_id, 'return policy', 'We offer a 30-day return policy for unworn items in original packaging. Please visit our returns page for more information.', FALSE),
                                                                                               (template_id, 'shipping time', 'Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days.', FALSE);
END $$;

-- Add template responses for Electronics template
DO $$
DECLARE
template_id INTEGER;
BEGIN
SELECT id INTO template_id FROM chatbot_templates WHERE name = 'Electronics Store';

INSERT INTO chatbot_responses (template_id, trigger_phrase, response_text, is_ai_enhanced) VALUES
                                                                                               (template_id, 'warranty', 'All our electronics come with a standard 1-year manufacturer warranty. Extended warranties are available for purchase.', FALSE),
                                                                                               (template_id, 'technical support', 'For technical support, please contact our support team at support@example.com or call 1-800-TECH-HELP.', FALSE),
                                                                                               (template_id, 'compatibility', 'You can find compatibility information on the product specifications tab on each product page.', FALSE);
END $$;

-- Add template responses for Food template
DO $$
DECLARE
template_id INTEGER;
BEGIN
SELECT id INTO template_id FROM chatbot_templates WHERE name = 'Food & Restaurant';

INSERT INTO chatbot_responses (template_id, trigger_phrase, response_text, is_ai_enhanced) VALUES
                                                                                               (template_id, 'menu', 'You can view our full menu on our website under the "Menu" section.', FALSE),
                                                                                               (template_id, 'allergens', 'We take allergens seriously. Please inform our staff of any allergies when ordering. Detailed allergen information is available upon request.', FALSE),
                                                                                               (template_id, 'delivery time', 'Our average delivery time is 30-45 minutes depending on your location and current order volume.', FALSE);
END $$;

-- Add template responses for Beauty template
DO $$
DECLARE
template_id INTEGER;
BEGIN
SELECT id INTO template_id FROM chatbot_templates WHERE name = 'Beauty & Cosmetics';

INSERT INTO chatbot_responses (template_id, trigger_phrase, response_text, is_ai_enhanced) VALUES
                                                                                               (template_id, 'cruelty free', 'Yes, all our products are cruelty-free and we never test on animals.', FALSE),
                                                                                               (template_id, 'ingredients', 'You can find a full list of ingredients on each product page under the "Ingredients" tab.', FALSE),
                                                                                               (template_id, 'product recommendation', 'For personalized product recommendations, please tell us about your skin type and concerns.', TRUE);
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS chatbots_industry_id_idx ON chatbots(industry_id);
CREATE INDEX IF NOT EXISTS chatbot_responses_chatbot_id_idx ON chatbot_responses(chatbot_id);
CREATE INDEX IF NOT EXISTS chatbot_responses_template_id_idx ON chatbot_responses(template_id);
CREATE INDEX IF NOT EXISTS chatbot_responses_trigger_idx ON chatbot_responses USING gin(to_tsvector('english', trigger_phrase));