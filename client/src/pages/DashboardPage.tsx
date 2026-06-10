import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar.js';
import { useAuth } from '../context/AuthContext.js';

const features = [
  {
    icon: 'campaign',
    title: 'Post Ads Instantly',
    description:
      'Publish your advertisement in seconds. Fill in the details, upload up to 5 photos, and your listing goes live immediately — no approval queue.',
    color: 'bg-primary-fixed text-primary',
  },
  {
    icon: 'search',
    title: 'Discover & Browse',
    description:
      'Explore a rich marketplace of ads from the community. Filter by category or use the keyword search to find exactly what you need.',
    color: 'bg-tertiary-fixed text-tertiary',
  },
  {
    icon: 'star',
    title: 'Ratings & Reviews',
    description:
      'Leave honest star ratings and written reviews on any ad. Transparent feedback builds trust between buyers and sellers.',
    color: 'bg-secondary-container text-secondary',
  },
  {
    icon: 'photo_library',
    title: 'Beautiful Image Galleries',
    description:
      'Each ad supports a navigable image gallery with up to 5 photos, powered by Cloudinary for lightning-fast CDN delivery.',
    color: 'bg-primary-fixed text-primary',
  },
  {
    icon: 'notifications',
    title: 'Email Notifications',
    description:
      'Ad owners get instant email alerts whenever a new review is posted on one of their listings — stay informed at all times.',
    color: 'bg-tertiary-fixed text-tertiary',
  },
  {
    icon: 'security',
    title: 'Secure by Design',
    description:
      'Every route is protected by Clerk authentication. Ownership is verified server-side before any write operation, keeping your data safe.',
    color: 'bg-secondary-container text-secondary',
  },
];

const steps = [
  { step: '01', title: 'Create an Account', description: 'Sign up with your email or Google in seconds via Clerk.' },
  { step: '02', title: 'Set Up Your Profile', description: 'Add your username, photo, phone number, and a short bio.' },
  { step: '03', title: 'Post Your First Ad', description: 'Fill in the details, upload photos, and go live instantly.' },
  { step: '04', title: 'Connect & Sell', description: 'Other users browse, review, and contact you directly.' },
];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow w-full">

        {/* ── Hero Section ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-surface to-tertiary-fixed/20 pt-xxl pb-[80px] px-md md:px-xl">
          {/* Decorative blobs */}
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-tertiary/10 blur-[100px] pointer-events-none" />

          <div className="max-w-container-max mx-auto relative z-10 flex flex-col items-center text-center gap-lg">
            {/* Brand badge */}
            <span className="inline-flex items-center gap-xs bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm px-md py-[6px] rounded-full">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
              Welcome to AdHub
            </span>

            <h1 className="font-headline-lg text-headline-lg md:text-[44px] md:leading-[54px] text-on-surface tracking-tight max-w-[700px] font-bold">
              Your Personal Marketplace,{' '}
              <span className="text-primary">Built for Everyone</span>
            </h1>

            <p className="font-body-lg text-body-lg text-secondary max-w-[560px]">
              AdHub is a secure, community-driven advertisement platform where you can buy, sell, and discover goods
              and services posted by real people — all in one elegant feed.
            </p>

            <div className="flex flex-wrap gap-md justify-center mt-sm">
              <Link
                to="/ads/create"
                className="bg-primary text-on-primary font-label-md text-label-md px-xl py-md rounded-xl shadow-1 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-xs border-t border-white/20"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Post an Ad
              </Link>
              <Link
                to="/"
                className="bg-surface-container-lowest text-on-surface border border-outline-variant font-label-md text-label-md px-xl py-md rounded-xl hover:bg-surface-container-low transition-all flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[20px]">explore</span>
                Browse the Feed
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stats Bar ── */}
        <section className="bg-surface-container-lowest border-y border-outline-variant/30 py-lg px-md md:px-xl">
          <div className="max-w-container-max mx-auto grid grid-cols-2 md:grid-cols-4 gap-lg text-center">
            {[
              { value: 'Free', label: 'Always Free to Use' },
              { value: '5', label: 'Photos Per Ad' },
              { value: 'Instant', label: 'Live Publishing' },
              { value: 'Secure', label: 'Auth by Clerk' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-xs">
                <span className="font-display-lg text-[32px] font-bold text-primary leading-none">{stat.value}</span>
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features Grid ── */}
        <section className="py-xxl px-md md:px-xl bg-surface">
          <div className="max-w-container-max mx-auto flex flex-col gap-xl">
            <div className="text-center flex flex-col gap-sm">
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                Everything You Need
              </h2>
              <p className="font-body-md text-body-md text-secondary max-w-[480px] mx-auto">
                A complete set of tools to help you post, discover, and connect with confidence.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant/20 shadow-1 flex flex-col gap-md hover:shadow-2 hover:border-primary/20 transition-all duration-200 group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${f.color}`}>
                    <span
                      className="material-symbols-outlined text-[24px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {f.icon}
                    </span>
                  </div>
                  <div className="flex flex-col gap-xs">
                    <h3 className="font-headline-md text-[18px] font-semibold text-on-surface group-hover:text-primary transition-colors">
                      {f.title}
                    </h3>
                    <p className="font-body-sm text-body-sm text-secondary leading-relaxed">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="py-xxl px-md md:px-xl bg-surface-container-low">
          <div className="max-w-container-max mx-auto flex flex-col gap-xl">
            <div className="text-center flex flex-col gap-sm">
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">How It Works</h2>
              <p className="font-body-md text-body-md text-secondary">Get started in four simple steps.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter relative">
              {/* Connector line on desktop */}
              <div className="hidden lg:block absolute top-[28px] left-[calc(12.5%+16px)] right-[calc(12.5%+16px)] h-[2px] bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30" />

              {steps.map((s) => (
                <div key={s.step} className="flex flex-col items-center text-center gap-md relative">
                  <div className="w-14 h-14 rounded-full bg-primary text-on-primary font-bold text-[18px] flex items-center justify-center shadow-1 border-4 border-surface-container-low z-10">
                    {s.step}
                  </div>
                  <div className="flex flex-col gap-xs">
                    <h3 className="font-headline-md text-[16px] font-semibold text-on-surface">{s.title}</h3>
                    <p className="font-body-sm text-body-sm text-secondary">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tech Stack ── */}
        <section className="py-xxl px-md md:px-xl bg-surface">
          <div className="max-w-container-max mx-auto flex flex-col items-center gap-xl text-center">
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Built on Modern Infrastructure
            </h2>

            <div className="flex flex-wrap justify-center gap-md">
              {[
                { label: 'React + Vite', icon: 'web', desc: 'Frontend' },
                { label: 'Node.js + Express', icon: 'storage', desc: 'Backend API' },
                { label: 'PostgreSQL', icon: 'database', desc: 'Database' },
                { label: 'Clerk Auth', icon: 'lock', desc: 'Authentication' },
                { label: 'Cloudinary', icon: 'cloud_upload', desc: 'Image Storage' },
                { label: 'Resend', icon: 'mail', desc: 'Email Alerts' },
              ].map((tech) => (
                <div
                  key={tech.label}
                  className="flex items-center gap-sm bg-surface-container-lowest border border-outline-variant/30 px-lg py-sm rounded-xl shadow-1 hover:border-primary/30 transition-all"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">{tech.icon}</span>
                  <div className="flex flex-col items-start">
                    <span className="font-label-md text-label-md text-on-surface">{tech.label}</span>
                    <span className="font-label-sm text-label-sm text-secondary">{tech.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="py-xxl px-md md:px-xl bg-gradient-to-br from-primary to-primary-container relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-[60px]" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-[60px]" />
          </div>
          <div className="max-w-container-max mx-auto flex flex-col items-center text-center gap-lg relative z-10">
            <h2 className="font-headline-lg text-headline-lg text-on-primary tracking-tight max-w-[560px]">
              Ready to List Your First Ad?
            </h2>
            <p className="font-body-lg text-body-lg text-on-primary/80 max-w-[440px]">
              {user
                ? `Welcome back, ${user.username}! Your next listing is just one click away.`
                : 'Join thousands of users already sharing and discovering on AdHub.'}
            </p>
            <div className="flex flex-wrap gap-md justify-center">
              <Link
                to="/ads/create"
                className="bg-surface-container-lowest text-primary font-label-md text-label-md px-xl py-md rounded-xl shadow-2 hover:brightness-105 active:scale-[0.98] transition-all flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Post an Ad
              </Link>
              {user && (
                <Link
                  to={`/profile/${user.id}`}
                  className="border border-on-primary/30 bg-transparent text-on-primary font-label-md text-label-md px-xl py-md rounded-xl hover:bg-on-primary/10 transition-all flex items-center gap-xs"
                >
                  <span className="material-symbols-outlined text-[20px]">person</span>
                  View My Profile
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
