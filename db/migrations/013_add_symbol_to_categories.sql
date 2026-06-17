ALTER TABLE categories ADD COLUMN symbol VARCHAR(50) DEFAULT 'category' NOT NULL;

-- Update seeded categories with their correct symbols
UPDATE categories SET symbol = 'devices' WHERE name = 'Electronics';
UPDATE categories SET symbol = 'chair' WHERE name = 'Furniture';
UPDATE categories SET symbol = 'directions_car' WHERE name = 'Vehicles';
UPDATE categories SET symbol = 'build' WHERE name = 'Services';
UPDATE categories SET symbol = 'category' WHERE name = 'Other';
