-- Replace 'Fakna' with 'ZoBazar' in seeded page contents
UPDATE pages
SET content = REPLACE(content, 'Fakna', 'ZoBazar')
WHERE slug IN ('home', 'about');

UPDATE pages
SET content = REPLACE(content, 'fakna', 'zobazar')
WHERE slug IN ('home', 'about');
