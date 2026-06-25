CREATE TABLE IF NOT EXISTS pages (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial data for Home and About pages
INSERT INTO pages (slug, title, content) VALUES
(
    'home',
    'Discover & Promote Advertisements Instantly',
    'Browse local services, premium products, and verified stores posted by the Fakna community. Build trust and grow your audience.'
),
(
    'about',
    'Your Personal Marketplace, Built for Everyone',
    'Fakna is a secure, community-driven advertisement platform where you can buy, sell, and discover goods and services posted by real people — all in one elegant feed.'
)
ON CONFLICT (slug) DO NOTHING;
