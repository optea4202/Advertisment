-- Seed PC and Laptops top-level categories
INSERT INTO categories (name, symbol, parent_id)
VALUES 
  ('PC', 'desktop_windows', NULL),
  ('Laptops', 'laptop', NULL)
ON CONFLICT (name) DO UPDATE 
SET parent_id = EXCLUDED.parent_id, symbol = EXCLUDED.symbol;

-- Seed PC subcategories under PC (level 2)
INSERT INTO categories (name, symbol, parent_id)
VALUES
  ('PC Components', 'memory', (SELECT id FROM categories WHERE name = 'PC')),
  ('PC Builds', 'construction', (SELECT id FROM categories WHERE name = 'PC')),
  ('Handheld Gaming PC', 'sports_esports', (SELECT id FROM categories WHERE name = 'PC')),
  ('Apple Mac', 'desktop_mac', (SELECT id FROM categories WHERE name = 'PC')),
  ('PC Accessories', 'keyboard_mouse', (SELECT id FROM categories WHERE name = 'PC'))
ON CONFLICT (name) DO UPDATE 
SET parent_id = EXCLUDED.parent_id, symbol = EXCLUDED.symbol;

-- Seed PC Components subcategories under PC Components (level 3)
INSERT INTO categories (name, symbol, parent_id)
VALUES
  ('PC Graphics Card', 'image', (SELECT id FROM categories WHERE name = 'PC Components')),
  ('Processor (CPU)', 'developer_board', (SELECT id FROM categories WHERE name = 'PC Components')),
  ('Power Supply', 'power', (SELECT id FROM categories WHERE name = 'PC Components')),
  ('Cabinet', 'ad_units', (SELECT id FROM categories WHERE name = 'PC Components')),
  ('Coolers', 'ac_unit', (SELECT id FROM categories WHERE name = 'PC Components')),
  ('Monitors', 'monitor', (SELECT id FROM categories WHERE name = 'PC Components')),
  ('Motherboards', 'view_in_ar', (SELECT id FROM categories WHERE name = 'PC Components')),
  ('Mice', 'mouse', (SELECT id FROM categories WHERE name = 'PC Components')),
  ('Keyboard', 'keyboard', (SELECT id FROM categories WHERE name = 'PC Components')),
  ('Desktop/Laptop RAM', 'memory', (SELECT id FROM categories WHERE name = 'PC Components')),
  ('SSD/HDD', 'hard_drive', (SELECT id FROM categories WHERE name = 'PC Components')),
  ('Webcam', 'videocam', (SELECT id FROM categories WHERE name = 'PC Components'))
ON CONFLICT (name) DO UPDATE 
SET parent_id = EXCLUDED.parent_id, symbol = EXCLUDED.symbol;
