import React, { useState } from 'react';
import { reportContent } from '../api/reports.js';

interface ReportModalProps {
  type: 'ad' | 'user' | 'review';
  itemId: number;
  onClose: () => void;
}

const PREDEFINED_REASONS = [
  'Spam or misleading',
  'Scam or fraud',
  'Harassment / Abuse',
  'Inappropriate content',
  'Other'
];

export const ReportModal: React.FC<ReportModalProps> = ({ type, itemId, onClose }) => {
  const [selectedReason, setSelectedReason] = useState<string>(PREDEFINED_REASONS[0]);
  const [customDetails, setCustomDetails] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const finalReason = selectedReason === 'Other'
      ? customDetails.trim()
      : `${selectedReason}${customDetails.trim() ? `: ${customDetails.trim()}` : ''}`;

    if (!finalReason) {
      setErrorMsg('Please specify a reason for your report.');
      setSubmitting(false);
      return;
    }

    try {
      await reportContent(type, itemId, finalReason);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Failed to submit report:', err);
      setErrorMsg(err.response?.data?.error?.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getHeaderTitle = () => {
    switch (type) {
      case 'ad': return 'Report this Advertisement';
      case 'user': return 'Report this User Profile';
      case 'review': return 'Report this Comment';
      default: return 'Report Content';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm px-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface-container-lowest rounded-2xl shadow-2 border border-outline-variant/30 p-lg w-full max-w-md flex flex-col gap-md animate-fade-in relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-md right-md text-on-surface-variant hover:text-on-surface p-xs rounded-full hover:bg-surface-container transition-colors"
          title="Close modal"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {success ? (
          <div className="flex flex-col items-center justify-center py-xl gap-sm text-center">
            <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary animate-bounce-short">
              <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div>
              <h3 className="font-headline-md text-[20px] font-semibold text-on-surface">Thank You</h3>
              <p className="font-body-sm text-body-sm text-secondary mt-xs max-w-xs">
                Your report has been submitted to the administrator for review.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-md">
            {/* Header */}
            <div className="flex items-center gap-sm pr-lg">
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-error flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
              </div>
              <div>
                <h2 className="font-headline-md text-[18px] font-semibold text-on-surface leading-snug">
                  {getHeaderTitle()}
                </h2>
                <p className="font-body-sm text-[12px] text-on-surface-variant/70 mt-[2px]">
                  Help us keep Fakna safe. Why are you reporting this?
                </p>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-sm bg-error-container text-on-error-container text-body-sm rounded-lg border border-error/10 flex items-center gap-xs">
                <span className="material-symbols-outlined text-[18px] text-error flex-shrink-0">report_problem</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Radio options */}
            <div className="flex flex-col gap-xs mt-xs">
              {PREDEFINED_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-md px-md py-sm rounded-xl border cursor-pointer transition-all hover:bg-surface-container-low ${
                    selectedReason === reason
                      ? 'border-primary bg-primary-fixed/30 text-primary font-semibold'
                      : 'border-outline-variant/30 text-on-surface-variant'
                  }`}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="font-body-sm text-body-sm">{reason}</span>
                </label>
              ))}
            </div>

            {/* Custom textarea details */}
            <div className="flex flex-col gap-xs">
              <label htmlFor="report-details" className="font-label-sm text-label-sm text-secondary">
                {selectedReason === 'Other' ? 'Please describe (required)' : 'Additional details (optional)'}
              </label>
              <textarea
                id="report-details"
                value={customDetails}
                onChange={(e) => setCustomDetails(e.target.value)}
                placeholder={selectedReason === 'Other' ? 'Describe the issue in detail…' : 'Provide any additional context…'}
                rows={3}
                required={selectedReason === 'Other'}
                maxLength={500}
                className="w-full resize-none bg-surface-container border border-outline-variant rounded-xl px-md py-sm font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-sm justify-end mt-sm">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-md py-sm rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-md py-sm rounded-xl font-label-md text-label-md bg-error text-on-error hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-xs"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-on-error/30 border-t-on-error rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">flag</span>
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
