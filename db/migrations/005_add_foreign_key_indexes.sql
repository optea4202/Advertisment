-- Add indexes on foreign keys to optimize joins and query speed
CREATE INDEX IF NOT EXISTS idx_ads_owner_id ON ads(owner_id);
CREATE INDEX IF NOT EXISTS idx_ad_images_ad_id ON ad_images(ad_id);
CREATE INDEX IF NOT EXISTS idx_reviews_ad_id ON reviews(ad_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
