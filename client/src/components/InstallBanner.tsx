import { useState, useEffect } from 'react';

/** Returns true when running in Mobile Safari on iOS but NOT already installed as a PWA. */
function isIosSafariNotInstalled(): boolean {
  const ua = navigator.userAgent;
  const isIos = /iPhone|iPad|iPod/i.test(ua);
  const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return isIos && !isInStandaloneMode;
}

const DISMISS_KEY = 'adhub_ios_banner_dismissed';

export function InstallBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(DISMISS_KEY);
    if (!dismissed && isIosSafariNotInstalled()) {
      // Short delay so it doesn't flash during route transitions
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleDismiss() {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="banner"
      aria-label="Install AdHub on your home screen"
      className="install-banner"
    >
      <div className="install-banner__content">
        <span className="material-symbols-outlined install-banner__icon">ios_share</span>
        <p className="install-banner__text">
          <strong>Install AdHub</strong> — tap{' '}
          <span
            className="material-symbols-outlined install-banner__inline-icon"
            aria-label="Share button"
          >
            ios_share
          </span>{' '}
          then <strong>"Add to Home Screen"</strong>
        </p>
      </div>
      <button
        id="install-banner-dismiss"
        className="install-banner__close"
        aria-label="Dismiss install prompt"
        onClick={handleDismiss}
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
}
