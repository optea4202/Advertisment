-- Update any reviews without text so their original star rating context isn't lost
UPDATE reviews 
SET review_text = 'Left a ' || star_rating || ' star rating' 
WHERE review_text IS NULL OR TRIM(review_text) = '';

-- Drop the star_rating column
ALTER TABLE reviews DROP COLUMN IF EXISTS star_rating;

-- Make review_text NOT NULL since comments cannot be empty
ALTER TABLE reviews ALTER COLUMN review_text SET NOT NULL;
