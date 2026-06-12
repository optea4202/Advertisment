import React from 'react';
import { type Review } from '../api/reviews.js';
import { useAuth } from '../context/AuthContext.js';

interface ReviewListProps {
  reviews: Review[];
  loading: boolean;
  error: Error | null;
  onReportReview?: (reviewId: number) => void;
}

export const ReviewList: React.FC<ReviewListProps> = ({ reviews, loading, error, onReportReview }) => {
  const { user } = useAuth();
  if (error) {
    return (
      <div className="p-md bg-error-container text-on-error-container rounded-lg border border-error/10 text-body-sm text-center">
        Failed to load reviews. Please refresh the page to try again.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-md gap-sm">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <span className="font-label-sm text-label-sm text-secondary">Loading reviews...</span>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-xl flex flex-col items-center justify-center text-center gap-sm">
        <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-secondary">
          <span className="material-symbols-outlined text-[24px]">rate_review</span>
        </div>
        <div>
          <h4 className="font-label-md text-label-md text-on-surface font-semibold">No reviews yet</h4>
          <p className="font-body-sm text-body-sm text-secondary mt-xs max-w-xs">
            Be the first to review this advertisement.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-md">
      <h4 className="font-label-md text-label-md text-on-surface font-semibold">
        Reviews ({reviews.length})
      </h4>

      <div className="flex flex-col gap-md divide-y divide-outline-variant/10">
        {reviews.map((review, index) => (
          <div 
            key={review.id} 
            className={`flex flex-col gap-sm ${index > 0 ? 'pt-md' : ''}`}
          >
            {/* Header info (Reviewer details + Stars) */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-sm">
                
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center overflow-hidden">
                  {review.reviewer_photo ? (
                    <img 
                      src={review.reviewer_photo} 
                      alt={review.reviewer_name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-fixed flex items-center justify-center text-primary font-bold uppercase text-body-sm">
                      {review.reviewer_name.substring(0, 2)}
                    </div>
                  )}
                </div>

                {/* Name & Date */}
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold leading-tight">
                    {review.reviewer_name}
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary mt-[2px]">
                    {new Date(review.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </span>
                </div>
              </div>

              {/* Star Rating Display & Report Button */}
              <div className="flex items-center gap-sm">
                <div className="flex items-center gap-[2px]">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= review.star_rating;
                    return (
                      <span
                        key={star}
                        className="material-symbols-outlined text-[18px] select-none block"
                        style={{
                          fontVariationSettings: isFilled ? "'FILL' 1" : "'FILL' 0",
                          color: isFilled ? '#ffb700' : 'var(--color-outline-variant)'
                        }}
                      >
                        star
                      </span>
                    );
                  })}
                </div>

                {user?.id !== review.reviewer_id && onReportReview && (
                  <button
                    onClick={() => onReportReview(review.id)}
                    className="text-on-surface-variant hover:text-error transition-colors p-[6px] rounded-full hover:bg-surface-container flex items-center justify-center focus:outline-none"
                    title="Report review"
                  >
                    <span className="material-symbols-outlined text-[18px]">flag</span>
                  </button>
                )}
              </div>
            </div>

            {/* Written Comment */}
            {review.review_text && (
              <p className="font-body-md text-body-md text-secondary leading-relaxed pl-[48px] whitespace-pre-line">
                {review.review_text}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
