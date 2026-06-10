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