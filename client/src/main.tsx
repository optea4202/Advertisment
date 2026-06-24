import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'

// Register service worker with auto-update.
// Shows a non-blocking toast when a new version is available.
const updateSW = registerSW({
  onNeedRefresh() {
    // Show a minimal "Update available" banner
    const banner = document.createElement('div');
    banner.id = 'sw-update-banner';
    banner.innerHTML = `
      <div style="
        position:fixed;bottom:16px;left:50%;transform:translateX(-50%);
        background:#1e2329;border:1px solid rgba(0,104,95,0.4);
        color:#e2e8f0;border-radius:12px;padding:12px 20px;
        font-family:Inter,-apple-system,sans-serif;font-size:0.875rem;
        display:flex;align-items:center;gap:12px;z-index:99999;
        box-shadow:0 8px 32px rgba(0,0,0,0.4);max-width:360px;
      ">
        <span style="color:#00857a;font-size:18px;">↻</span>
        <span>New version available.</span>
        <button onclick="document.getElementById('sw-update-banner').remove();window.__swUpdateSW__(true);" style="
          background:#00685f;color:#fff;border:none;border-radius:8px;
          padding:6px 14px;font-size:0.8125rem;font-weight:600;cursor:pointer;
          white-space:nowrap;
        ">Update</button>
        <button onclick="document.getElementById('sw-update-banner').remove();" style="
          background:transparent;color:#64748b;border:none;cursor:pointer;
          font-size:18px;line-height:1;padding:4px;
        ">✕</button>
      </div>
    `;
    document.body.appendChild(banner);
  },
  onOfflineReady() {
    console.log('[PWA] App is ready to work offline.');
  },
  immediate: true,
});

// Expose the update function globally so the inline button onclick can call it
(window as any).__swUpdateSW__ = updateSW;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

