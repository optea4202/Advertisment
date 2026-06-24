CREATE TABLE IF NOT EXISTS user_reviews (
    id SERIAL PRIMARY KEY,
    target_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    reviewer_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    star_rating INTEGER NOT NULL CHECK (star_rating >= 1 AND star_rating <= 5),
    review_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_self_review CHECK (reviewer_id <> target_user_id),
    CONSTRAINT uq_reviewer_target UNIQUE (reviewer_id, target_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_reviews_target_user_id ON user_reviews(target_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewer_id ON user_reviews(reviewer_id);
