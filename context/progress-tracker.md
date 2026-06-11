# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Phase 9: Project Completed

## Current Goal

- None (Project fully implemented, compiled, and ready for deployment).

## Completed

- Client project foundation initialized with React, Vite, TS, Tailwind CSS, and custom design tokens in `variables.css`.
- Server project foundation initialized with Express, TS, Cors, tsx, and Zod env validator.
- Database migrations 001 through 004 written and successfully applied to Neon PostgreSQL.
- Express entrypoint with database-connected health check `/health` returning `200 OK`.
- Clerk Authentication integrated on both backend (JWT token verification middleware + ban status checks) and frontend (React Routing, ClerkProvider, AuthProvider, and ProtectedRoute).
- Profile Setup Page completed with frontend input validations and Cloudinary profile photo upload.
- Ad posting bento form and personal inventory list page fully implemented, supporting multi-image upload up to 5 files using Cloudinary.
- Ad Editing Page and deletion actions fully integrated (handles Cloudinary deletion cleanup for removed/swapped images and database references).
- Ad Feed page, SearchBar with debouncing, CategoryFilter, and custom hooks fully implemented (Unit 5).
- Ad Detail Page, responsive navigable ImageGallery carousel, useAd hook, and routes fully implemented (Unit 6).
- Star rating submissions, self-review checks, Resend utility helper, review endpoints, and ReviewForm/ReviewList components fully integrated (Unit 7).
- Admin panel, tabbed sections (Ads, Reviews, Users), admin ban account triggers, admin deletion actions, and AdminRoute guard fully integrated (Unit 8).
- Production build commands, environment variables schema validation, and deployment plan finalized (Unit 9).
- Verified that both the server and client builds compile successfully.
- Resolved token expiration/refresh bug: replaced static setAuthToken with dynamic Axios request interceptors that retrieve and attach fresh Clerk JWT tokens before every API request.
- Implemented system-wide Dark Mode: added theme variables in `variables.css`, created `ThemeContext`, wrapped the application, and added a custom toggle button in the `Navbar`.
- Implemented Profile Settings: created a dedicated `/settings` route/page allowing users to edit profile username, phone number, bio, and photo (with Cloudinary uploads), integrating form validation and error/success alerts.
- Implemented Public User Profiles: created `GET /api/users/:id` backend endpoint returning a safe public profile (no email/phone/clerk_id), added `UserProfilePage` at `/profile/:id`, added "My Profile" nav link, made the avatar avatar and publisher cards on ad detail page clickable links to user profiles. Other users can browse any non-banned user's profile and their ads.
- Implemented a mobile-friendly Floating Action Button (FAB) for posting advertisements on small viewports (`sm:hidden`), with interactive hover/click micro-interactions and custom entering bounce animation (`bounce-short`), ensuring visibility is gated to non-creation/edit routes.
- Optimized page navigation and initial loading times by establishing database indexes on relational foreign keys (`ads.owner_id`, `ad_images.ad_id`, `reviews.ad_id`, `reviews.reviewer_id`), implementing client-side Stale-While-Revalidate (SWR) caching for ads, profiles, and feeds, caching database user profiles in `localStorage` in `AuthContext` to skip session loading screen wait times, and registering a centralized cache invalidation response interceptor on all write requests (`POST`, `PUT`, `DELETE`).
- Added a mobile-only About (info) icon button to the header to enable access on portrait viewports, and added a footer credit saying "Developed by optea" to the About page.
- Enabled users to edit and delete their advertisement posts directly from their own user profile page by conditionally passing action triggers to `AdCard` components when viewing their own profile.
- Implemented peer-to-peer Chat with Seller feature: added `conversations` and `messages` PostgreSQL tables (migration 006), created full backend REST API (`/api/chats`) with Zod validation, auth guards, and participant ownership checks, built `InboxPage` with responsive split-screen desktop / toggled mobile layout, SWR-style polling at 3.5s intervals, message bubbles, and auto-scroll. Added an inbox icon button to the Navbar (left of theme toggle on desktop, floating FAB above the post button on mobile), and a "Chat with Seller" CTA button on `AdDetailPage` (hidden for ad owners).
- Fixed mobile inbox styling to use dynamic viewport height (100dvh) for a full-screen, locked, double-scrollbar-free layout, and configured mobile floating action buttons (FABs) to hide specifically when viewing the `/inbox` route to avoid visual clutter and overlay conflicts.
- Stabilized mobile chat window layout against keyboard zoom/scrolling shifts using the VisualViewport API, resetting window scroll, and caching/passing the seller profile metadata across routers (`location.state`) to eliminate header auto-hiding during initial load and polling updates.
- Implemented unread message notifications by introducing a shared ChatContext that polls conversations, tracks read states in localStorage, and renders a pulsing emerald dot on the Navbar inbox icon. Removed the duplicate floating Inbox FAB on mobile view for a cleaner layout.
- Added "Message" button to other users' public profile pages so users can start a direct chat without needing to view an ad. Added photo upload support in the chat input area: users can attach an image (with a live thumbnail preview), send image-only or image+text messages via Cloudinary, and images render as tappable/zoomable bubbles in the chat thread. Required DB migration 007 to add `image_url` column to the `messages` table.
- Designed and implemented a responsive, fancy, and eye-catching landing page (`FeedPage`) for both PC and mobile viewports, including a premium Hero Showcase with animated text gradients, animated gradient flow background, glassmorphism spotlight preview card featuring automatic sliding rotation and navigation dots, active listing statistics, and visual category icons.
- Made the entire advertisement card container a semantic Link component (with cursor-pointer) on both the primary AdCard and the spotlight preview card to ensure native browser/touch navigation support (including on mobile portrait views). Nested action buttons (Edit, Delete, and Slider dots) have event propagation and default actions blocked to keep their interactions separate and fully functional. Removed the "Open Ad" button.
- Added client-side image compression using HTML5 Canvas (`client/src/utils/imageCompressor.ts`) in the ad creation/editing forms and profile setup/settings. This reduces large high-resolution camera images from up to 10MB down to a few hundred kilobytes (and small 400px profile avatars) on the fly, speeding up ad publishing and updates on mobile networks by up to 95%.
- Implemented PWA (Progressive Web App) support to enable iOS users to install AdHub directly on their iPhone/iPad Home Screen. Changes: added `manifest.webmanifest` with brand teal theme, added iOS-specific meta tags (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-touch-icon`) in `index.html`, configured `vite-plugin-pwa` with Workbox (network-first API caching, cache-first Google Fonts), added `--safe-area-inset-bottom` CSS variable for iPhone home indicator clearance, and created `InstallBanner` component that detects iOS Safari non-standalone mode and guides users through the Add to Home Screen flow.
- Implemented message edit, message delete, and conversation delete for P2P chat. DB migration 008 adds `is_edited BOOLEAN DEFAULT FALSE` to `messages`. New backend endpoints: `PUT /api/chats/messages/:messageId` (edit own message text, server-side ownership check), `DELETE /api/chats/messages/:messageId` (delete own message with Cloudinary cleanup if image), `DELETE /api/chats/:id` (delete entire conversation with Cloudinary cleanup of all message images). Frontend: `useMessages` hook exposes `editMsg` and `deleteMsg` with optimistic local state; InboxPage shows hover-reveal edit/delete buttons on own messages, inline edit textarea with Save/Cancel (Enter to save, Escape to cancel), inline delete confirmation ("Delete? Yes / No"), `(edited)` label after timestamp on edited messages, and a trash icon in the chat header that opens a confirmation modal before deleting the whole conversation.
- Implemented user search bar inside the Inbox left panel: added `GET /api/users/search?q=` backend endpoint (ILIKE query, excludes banned users and self, capped at 10 results) with DB function, service wrapper, controller, and route (registered before `/:id` to avoid Express parameter clash); added `searchUsers` client API wrapper; added debounced (300ms) search input with animated dropdown inside the InboxPage left panel — shows avatar, username, bio, and a send icon per result, clicking any result calls `startConversation` and opens the chat thread immediately.
- Changed the website name and branding from AdHub to Fakna across all pages, components, SEO meta tags, email templates, configuration files, and package metadata.


## In Progress

- None.

## Next Up

- None.

## Open Questions

- None.

## Architecture Decisions

- Configured TailwindCSS v3 mapped to design system CSS variables in `variables.css`.

## Session Notes

- FeedPage, SearchBar, CategoryFilter, and useFeed hooks completed (Unit 5).
- AdDetailPage, ImageGallery (navigable carousel with thumbnail list), and useAd hooks completed (Unit 6).
- ReviewForm, ReviewList, useReviews hook, backend services/routes, and Resend email alerts completed (Unit 7).
- AdminPage tabs, admin API callers, requireAdmin server middleware, and AdminRoute component route guards completed (Unit 8).
- Finalized production configs, verified zero tsc errors, and generated release walkthrough logs (Unit 9).
- Verified search query ILIKE parsing and category database filters on the backend.
- Excluded banned users' ads from the public feed.