import { useState, useEffect } from 'react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [visible, setVisible] = useState(!navigator.onLine);
  const [justCameOnline, setJustCameOnline] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setVisible(true);
      setJustCameOnline(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setJustCameOnline(true);
      // Show "Back online" briefly, then hide
      setTimeout(() => {
        setVisible(false);
        setJustCameOnline(false);
      }, 3000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px 16px',
        background: justCameOnline
          ? 'rgba(16, 185, 129, 0.92)'   // green when back online
          : 'rgba(220, 38, 38, 0.88)',    // red when offline
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        color: '#fff',
        fontSize: '0.8125rem',
        fontWeight: 500,
        fontFamily: 'Inter, -apple-system, sans-serif',
        letterSpacing: '0.01em',
        boxShadow: '0 -2px 16px rgba(0,0,0,0.2)',
        transition: 'background 0.4s ease',
        // Safe area for iPhone home indicator
        paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
      }}
      role="status"
      aria-live="polite"
    >
      {/* Dot indicator */}
      <span
        style={{
          display: 'inline-block',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#fff',
          opacity: 0.8,
          flexShrink: 0,
          animation: isOffline ? 'offlinePulse 1.5s ease-in-out infinite' : 'none',
        }}
      />

      {/* Message */}
      <span>
        {justCameOnline
          ? '✓ Back online.'
          : 'You are offline. Browsing cached listings.'}
      </span>

      <style>{`
        @keyframes offlinePulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
};
