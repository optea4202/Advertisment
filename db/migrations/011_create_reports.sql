CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    reported_item_type VARCHAR(50) NOT NULL CHECK (reported_item_type IN ('ad', 'user', 'review')),
    ad_id INTEGER REFERENCES ads(id) ON DELETE CASCADE,
    reported_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_reported_id CHECK (
        (reported_item_type = 'ad' AND ad_id IS NOT NULL AND reported_user_id IS NULL AND review_id IS NULL) OR
        (reported_item_type = 'user' AND reported_user_id IS NOT NULL AND ad_id IS NULL AND review_id IS NULL) OR
        (reported_item_type = 'review' AND review_id IS NOT NULL AND ad_id IS NULL AND reported_user_id IS NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_ad_id ON reports(ad_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_review_id ON reports(review_id);
