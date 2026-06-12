CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed default categories
INSERT INTO categories (name) VALUES
  ('Electronics'),
  ('Furniture'),
  ('Vehicles'),
  ('Services'),
  ('Other')
ON CONFLICT (name) DO NOTHING;

-- Set default value for ads.category to 'Other'
ALTER TABLE ads ALTER COLUMN category SET DEFAULT 'Other';

-- If there are any ads with a category that doesn't exist in our categories table, map them to 'Other'
UPDATE ads SET category = 'Other' WHERE category NOT IN (SELECT name FROM categories);

-- Add foreign key constraint to ads.category referencing categories.name
ALTER TABLE ads 
ADD CONSTRAINT fk_ads_category 
FOREIGN KEY (category) 
REFERENCES categories(name) 
ON UPDATE CASCADE 
ON DELETE SET DEFAULT;
