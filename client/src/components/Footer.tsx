import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/30 text-on-surface mt-auto">
      <div className="w-full max-w-container-max mx-auto px-md md:px-xl py-xl md:py-xxl">
        {/* Main Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-xl">
          {/* Column 1: Brand Info */}
          <div className="flex flex-col gap-md">
            <Link to="/" className="flex items-center gap-[-12px] shrink-0 self-start group transition-transform duration-200 hover:scale-[1.02]">
              {/* Logo image */}
              <img
                src="/Project.png"
                alt="ZoBazar logo"
                width="56"
                height="56"
                className="flex-shrink-0 w-[56px] h-[56px] object-contain ml-3"
              />

              {/* Wordmark stacked to the right */}
              <span className="flex flex-col leading-tight select-none">
                <span
                  className="font-black tracking-widest text-[14px] md:text-[15px]"
                  style={{ letterSpacing: '0.12em' }}
                >
                  <span style={{ color: '#00685f' }}>Zo</span>
                  <span style={{ color: '#1A3E8C' }}>Bazar</span>
                </span>
                <span
                  className="font-semibold tracking-wider text-[8px] uppercase"
                  style={{ color: '#1A6FAB', letterSpacing: '0.1em' }}
                >
                  Mizoram Marketplace
                </span>
              </span>
            </Link>
            
            <p className="text-on-surface-variant text-body-sm leading-relaxed max-w-[280px]">
              Connecting local businesses, verified stores, and premium services directly with customers. Simple, secure, and community-driven.
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-sm mt-xs">
              <a 
                href="https://wa.me/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-primary-fixed hover:text-primary transition-all duration-200 flex items-center justify-center text-on-surface-variant group shadow-sm"
                title="Join our WhatsApp Community"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
                  alt="WhatsApp" 
                  className="w-4 h-4 object-contain group-hover:scale-110 transition-transform duration-200"
                />
              </a>
              <a 
                href="https://telegram.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-primary-fixed hover:text-primary transition-all duration-200 flex items-center justify-center text-on-surface-variant group shadow-sm"
                title="Join our Telegram Channel"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" 
                  alt="Telegram" 
                  className="w-4 h-4 object-contain group-hover:scale-110 transition-transform duration-200"
                />
              </a>
              <a 
                href="https://facebook.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-primary-fixed hover:text-primary transition-all duration-200 flex items-center justify-center text-on-surface-variant group shadow-sm"
                title="Follow us on Facebook"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" 
                  alt="Facebook" 
                  className="w-4 h-4 object-contain group-hover:scale-110 transition-transform duration-200"
                />
              </a>
              <a 
                href="https://twitter.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-primary-fixed hover:text-primary transition-all duration-200 flex items-center justify-center text-on-surface-variant group shadow-sm"
                title="Follow us on X"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/5/57/X_logo_2023_%28white%29.png" 
                  alt="X (formerly Twitter)" 
                  className="w-4 h-4 object-contain group-hover:scale-110 transition-transform duration-200 invert dark:invert-0"
                />
              </a>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div className="flex flex-col gap-sm">
            <h3 className="font-semibold text-on-surface text-label-sm uppercase tracking-wider">Explore</h3>
            <ul className="flex flex-col gap-xs p-0 m-0 list-none">
              <li>
                <Link to="/" className="text-on-surface-variant hover:text-primary transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-xs text-[13px] no-underline">
                  <span className="material-symbols-outlined text-[15px]">home</span>
                  Home Marketplace
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-on-surface-variant hover:text-primary transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-xs text-[13px] no-underline">
                  <span className="material-symbols-outlined text-[15px]">info</span>
                  About Platform
                </Link>
              </li>
              <li>
                <Link to="/" className="text-on-surface-variant hover:text-primary transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-xs text-[13px] no-underline">
                  <span className="material-symbols-outlined text-[15px]">search</span>
                  Search Advertisements
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal Section */}
          <div className="flex flex-col gap-sm lg:-ml-16">
            <h3 className="font-semibold text-on-surface text-label-sm uppercase tracking-wider">
              Terms &amp; condition and Privacy policy
            </h3>
            <ul className="flex flex-col gap-xs p-0 m-0 list-none">
              <li>
                <Link to="/terms" className="text-on-surface-variant hover:text-primary transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-xs text-[13px] no-underline">
                  <span className="material-symbols-outlined text-[15px]">gavel</span>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/policy" className="text-on-surface-variant hover:text-primary transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-xs text-[13px] no-underline">
                  <span className="material-symbols-outlined text-[15px]">policy</span>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Reliability Badge */}
          <div className="flex flex-col gap-sm">
            <h3 className="font-semibold text-on-surface text-label-sm uppercase tracking-wider">Support</h3>
            <ul className="flex flex-col gap-xs p-0 m-0 list-none mb-sm">
              <li className="text-on-surface-variant text-[13px] flex items-center gap-xs">
                <span className="material-symbols-outlined text-[15px] text-primary">mail</span>
                support@zobazar.com
              </li>
              <li className="text-on-surface-variant text-[13px] flex items-center gap-xs">
                <span className="material-symbols-outlined text-[15px] text-primary">contact_support</span>
                Help Center
              </li>
            </ul>

            {/* Health & Reliability Badge */}
            <div className="bg-primary/5 dark:bg-primary-fixed-dim/10 border border-primary/20 dark:border-primary-fixed-dim/20 rounded-xl p-sm flex items-center gap-sm self-start">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </div>
              <span className="text-[11px] font-semibold text-primary dark:text-primary-fixed uppercase tracking-wider">All Systems Operational</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright notice */}
        <div className="border-t border-outline-variant/15 mt-xl pt-lg flex flex-col md:flex-row justify-between items-center gap-sm">
          <p className="font-body-sm text-body-sm text-on-surface-variant text-center md:text-left m-0">
            &copy; {currentYear} <span className="font-semibold">zobazar</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
