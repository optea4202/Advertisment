import React, { useState } from 'react';

interface ProfileReviewFormProps {
  onSubmit: (rating: number, comment: string) => Promise<void>;
  initialRating?: number;
  initialComment?: string;
  isUpdate?: boolean;
}

export const ProfileReviewForm: React.FC<ProfileReviewFormProps> = ({ 
  onSubmit, 
  initialRating = 0, 
  initialComment = '',
  isUpdate = false
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(initialComment);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setErrorMsg('Please select a star rating.');
      return;
    }
    if (!comment.trim()) {
      setErrorMsg('Please write a review comment.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await onSubmit(rating, comment.trim());
      if (!isUpdate) {
        setRating(0);
        setComment('');
      }
    } catch (err: any) {
      console.error('Failed to submit profile review:', err);
      const apiError = err.response?.data?.error?.message || 'Failed to submit profile review. Please try again.';
      setErrorMsg(apiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-md md:p-lg flex flex-col gap-md">
      <h4 className="font-label-md text-label-md text-on-surface font-semibold">
        {isUpdate ? 'Update Profile Review' : 'Rate & Review this Seller'}
      </h4>
      
      {errorMsg && (
        <div className="p-sm bg-error-container text-on-error-container rounded-lg border border-error/10 text-body-sm font-body-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-md">
        {/* Star Rating Selectors */}
        <div className="flex flex-col gap-xs">
          <span className="font-label-sm text-label-sm text-secondary">Your Rating</span>
          <div className="flex items-center gap-xs">
            {[1, 2, 3, 4, 5].map((star) => {
              const isActive = star <= (hoverRating || rating);
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-[28px] focus:outline-none transition-transform active:scale-95 duration-100 p-[2px]"
                  title={`${star} star${star > 1 ? 's' : ''}`}
                >
                  <span 
                    className="material-symbols-outlined select-none block"
                    style={{
                      fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                      color: isActive ? '#ffb700' : 'var(--color-outline-variant)'
                    }}
                  >
                    star
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Written Review */}
        <div className="flex flex-col gap-xs">
          <label className="font-label-sm text-label-sm text-secondary" htmlFor="profile-review-comment">
            Review Comment
          </label>
          <div className="relative input-glow rounded-md transition-shadow duration-200">
            <textarea
              id="profile-review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience dealing with this member..."
              rows={3}
              className="w-full bg-surface-bright border border-outline-variant rounded-md px-md py-sm font-body-md text-body-md text-on-surface placeholder:text-secondary/60 focus:border-primary focus:outline-none transition-colors resize-y"
              maxLength={1000}
            ></textarea>
          </div>
          <span className="text-right text-[11px] font-body-sm text-secondary">{comment.length} / 1000 characters</span>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-on-primary font-label-md text-label-md px-xl py-md rounded-lg btn-primary-inner hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? 'Submitting...' : isUpdate ? 'Update Review' : 'Submit Review'}
            <span className="material-symbols-outlined text-[16px]">check</span>
          </button>
        </div>
      </form>
    </div>
  );
};
