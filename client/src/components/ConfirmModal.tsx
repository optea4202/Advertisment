import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm px-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-surface-container-lowest rounded-2xl shadow-2 border border-outline-variant/30 p-lg w-full max-w-sm flex flex-col gap-md animate-scale-up relative">
        {/* Header */}
        <div className="flex items-start gap-sm">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isDestructive ? 'bg-error-container text-error' : 'bg-primary-fixed text-primary'
          }`}>
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isDestructive ? 'warning' : 'help'}
            </span>
          </div>
          <div className="flex-grow">
            <h2 className="font-headline-md text-[18px] font-semibold text-on-surface leading-snug">
              {title}
            </h2>
            <p className="font-body-md text-body-sm text-secondary mt-xs">
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-sm justify-end mt-sm">
          <button
            type="button"
            onClick={onCancel}
            className="px-md py-sm rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-all"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-md py-sm rounded-xl font-label-md text-label-md text-white hover:brightness-110 active:scale-95 transition-all shadow-sm flex items-center gap-xs ${
              isDestructive ? 'bg-error text-on-error' : 'bg-primary text-on-primary'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
