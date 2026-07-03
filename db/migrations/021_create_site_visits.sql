CREATE TABLE site_visits (
  id SERIAL PRIMARY KEY,
  count INTEGER DEFAULT 0
);

INSERT INTO site_visits (count) VALUES (0);
