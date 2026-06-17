ALTER TABLE categories ADD COLUMN parent_id INT REFERENCES categories(id) ON DELETE SET NULL;

-- Seed subcategories under Electronics (Devices, Laptops, Phones)
INSERT INTO categories (name, symbol, parent_id)
VALUES 
  ('Laptops', 'laptop_mac', (SELECT id FROM categories WHERE name = 'Electronics')),
  ('Phones', 'devices', (SELECT id FROM categories WHERE name = 'Electronics'))
ON CONFLICT (name) DO NOTHING;

-- Seed subcategories under Furniture
INSERT INTO categories (name, symbol, parent_id)
VALUES 
  ('Chairs', 'chair', (SELECT id FROM categories WHERE name = 'Furniture'))
ON CONFLICT (name) DO NOTHING;

-- Seed subcategories under Vehicles
INSERT INTO categories (name, symbol, parent_id)
VALUES 
  ('Cars', 'directions_car', (SELECT id FROM categories WHERE name = 'Vehicles'))
ON CONFLICT (name) DO NOTHING;
