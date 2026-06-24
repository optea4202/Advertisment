import React, { useState } from 'react';

interface ReviewFormProps {
  onSubmit: (comment: string) => Promise<void>;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg('Please write a comment.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await onSubmit(comment.trim());
      setComment('');
    } catch (err: any) {
      console.error('Failed to submit comment:', err);
      const apiError = err.response?.data?.error?.message || 'Failed to submit your comment. Please try again.';
      setErrorMsg(apiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-md md:p-lg flex flex-col gap-md">
      <h4 className="font-label-md text-label-md text-on-surface font-semibold">
        Leave a Comment
      </h4>
      
      {errorMsg && (
        <div className="p-sm bg-error-container text-on-error-container rounded-lg border border-error/10 text-body-sm font-body-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-md">
        {/* Written comment */}
        <div className="flex flex-col gap-xs">
          <label className="font-label-sm text-label-sm text-secondary" htmlFor="review-comment">
            Comment
          </label>
          <div className="relative input-glow rounded-md transition-shadow duration-200">
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your comments on this item or service..."
              rows={3}
              className="w-full bg-surface-bright border border-outline-variant rounded-md px-md py-sm font-body-md text-body-md text-on-surface placeholder:text-secondary/60 focus:border-primary focus:outline-none transition-colors resize-y"
              maxLength={1000}
            ></textarea>
          </div>
          <span className="text-right text-[11px] font-body-sm text-secondary">{comment.length} / 1000 characters</span>
        </div>

        {/* Submit action */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-on-primary font-label-md text-label-md px-xl py-md rounded-lg btn-primary-inner hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Comment'}
            <span className="material-symbols-outlined text-[16px]">check</span>
          </button>
        </div>
      </form>
    </div>
  );
};
