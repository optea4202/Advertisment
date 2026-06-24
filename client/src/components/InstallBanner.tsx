import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already dismissed (stored in localStorage)
    const wasDismissed = localStorage.getItem('fakna_install_dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Check if running as installed PWA (standalone mode)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Detect iOS Safari
    const ua = window.navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    setIsIOS(ios);

    // Listen for Chrome/Android install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for successful app install
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setTimeout(() => setInstalled(false), 3000);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'dismissed') {
      handleDismiss();
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('fakna_install_dismissed', 'true');
  };

  // Don't show if already installed as PWA
  if (isStandalone) return null;
  // Don't show if user dismissed it
  if (dismissed) return null;
  // Don't show if neither iOS prompt nor Chrome prompt is available
  if (!isIOS && !deferredPrompt) return null;

  // Show success toast after install
  if (installed) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: '#00685f',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '100px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.875rem',
          fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          animation: 'fadeInUp 0.3s ease',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
        Fakna installed!
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px', // Above the mobile FAB
        left: '16px',
        right: '16px',
        zIndex: 9000,
        background: 'var(--color-surface-container, #1e2329)',
        border: '1px solid rgba(0, 104, 95, 0.35)',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        maxWidth: '420px',
        margin: '0 auto',
        animation: 'slideInUp 0.4s ease',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: '#00685f',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
        }}
      >
        🛍️
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-on-surface, #e2e8f0)', marginBottom: '2px' }}>
          Install Fakna App
        </div>
        {isIOS ? (
          <div style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant, #94a3b8)', lineHeight: 1.5 }}>
            Tap <strong>Share</strong> <span style={{ fontSize: '14px' }}>⎗</span> then <strong>"Add to Home Screen"</strong> to install.
          </div>
        ) : (
          <div style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant, #94a3b8)', lineHeight: 1.5 }}>
            Add to your home screen for offline access and a faster experience.
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstall}
            style={{
              background: '#00685f',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '7px 14px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Install
          </button>
        )}
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            color: 'var(--color-on-surface-variant, #64748b)',
            border: 'none',
            borderRadius: '8px',
            padding: '7px 8px',
            fontSize: '0.75rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Not now
        </button>
      </div>
    </div>
  );
};
