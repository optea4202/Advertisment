# Build Units — Advertisement Platform

Units are ordered by dependency. Each unit produces one visible, testable result before the next unit begins.
Complete each unit fully — including wiring, types, and verification — before starting the next.

---

## Unit 1 — Project Foundation

**What it builds:**
The entire project scaffold for both the client and server, a running Express server with a health check, a connected PostgreSQL database, and all four database migration files applied. After this unit, both dev servers start without errors and all tables exist in the database.

**Builds:**
- Monorepo folder structure: `client/`, `server/`, `db/migrations/`
- `client/` — React + Vite project with TypeScript, folder structure (`pages/`, `components/`, `hooks/`, `api/`, `context/`, `styles/`, `types/`), and `variables.css` with all design tokens from `ui-context.md`
- `server/` — Express app with TypeScript, folder structure (`routes/`, `controllers/`, `services/`, `middleware/`, `db/`, `config/`, `utils/`), and a working `GET /health` endpoint
- `server/config/` — Environment variable loader and validator; `.env` file with all required keys stubbed out
- `server/db/` — PostgreSQL client initialised and connected; connection verified on server start
- `db/migrations/001_create_users.sql` — `users` table
- `db/migrations/002_create_ads.sql` — `ads` table
- `db/migrations/003_create_ad_images.sql` — `ad_images` table
- `db/migrations/004_create_reviews.sql` — `reviews` table
- All four migrations applied to the Render PostgreSQL instance

**Visible result:** `npm run dev` starts both the React dev server and the Express server without errors. `GET /health` returns `200 OK`. All four tables exist and are queryable in PostgreSQL.

**Dependencies before starting:**
- Render account created with a PostgreSQL database instance provisioned
- Clerk account created with an application configured (email/password + Google OAuth enabled)
- Cloudinary account created
- Resend account created
- All API keys and credentials available to paste into `.env`

---

## Unit 2 — Authentication and User Profile

**What it builds:**
Full end-to-end authentication using Clerk — sign up, log in, Google Sign-In, and logout. A protected route system that redirects unauthenticated visitors to the login page. A profile setup page where users complete their profile after first sign-in. The user record is created in PostgreSQL on first login. Profile photos are uploaded to Cloudinary.

**Builds:**
- `client/` — Clerk provider wrapping the app; `LoginPage` and `SignUpPage` using Clerk components; `ProtectedRoute` wrapper that redirects to login if no session exists; `ProfileSetupPage` (username, profile photo upload, phone, email, bio); `useAuth` hook
- `server/middleware/requireAuth.ts` — Clerk JWT verification middleware; attaches verified `clerk_id` to `req`
- `server/middleware/requireNotBanned.ts` — Checks `is_banned` in PostgreSQL; returns `403` if true
- `server/db/users.ts` — Query functions: `createUser`, `getUserByClerkId`, `updateUser`
- `server/services/users.ts` — `getOrCreateUser` (creates the PostgreSQL row on first login), `updateProfile`
- `server/controllers/users.ts` — `getMe`, `updateMe`
- `server/routes/users.ts` — `GET /api/users/me`, `PUT /api/users/me`
- `server/utils/cloudinary.ts` — Cloudinary client initialised and upload helper function
- Profile photo uploaded to Cloudinary; URL saved to `users.photo_url`

**Visible result:** A new user can sign up with email/password or Google, land on the profile setup page, upload a profile photo, fill in their details, and save. On subsequent login, they are taken directly to their dashboard (empty for now). An unauthenticated visitor hitting any route except `/login` or `/signup` is redirected to `/login`.

**Dependencies:** Unit 1 complete. Clerk and Cloudinary credentials in `.env`.

---

## Unit 3 — Post an Ad and Dashboard

**What it builds:**
The ad creation form and the personal dashboard. A logged-in user can create an advertisement with all required fields and upload up to 5 images. After posting, the ad appears immediately on their dashboard, which lists all their own ads sorted newest-first.

**Builds:**
- `client/pages/DashboardPage.tsx` — Lists the current user's own ads newest-first; each ad card shows title, category, price, first image thumbnail, and Edit/Delete buttons (Delete is wired; Edit links to Unit 4)
- `client/pages/CreateAdPage.tsx` — Ad creation form: title, description, category (predefined dropdown + "Other"), price, location, contact info, image upload (up to 5 files with preview)
- `client/components/AdCard.tsx` — Reusable ad card component used on the dashboard and feed
- `client/api/ads.ts` — `createAd`, `getMyAds` fetch functions
- `client/hooks/useAds.ts` — `useMyAds` hook
- `server/db/ads.ts` — Query functions: `insertAd`, `insertAdImage`, `getAdsByOwner`
- `server/services/ads.ts` — `createAd` (uploads images to Cloudinary, inserts ad row, inserts image rows)
- `server/controllers/ads.ts` — `createAd`, `getMyAds`
- `server/routes/ads.ts` — `POST /api/ads`, `GET /api/ads/mine` (both protected by `requireAuth` + `requireNotBanned`)
- Backend enforces maximum 5 images; rejects with `400` if exceeded

**Visible result:** A logged-in user can click "Post Ad", fill out the form, upload images, submit, and immediately see the new ad appear on their dashboard. The dashboard is sorted newest-first. A user with no ads sees an empty state with a prompt to post their first ad.

**Dependencies:** Unit 2 complete.

---

## Unit 4 — Edit and Delete an Ad

**What it builds:**
The ability for a user to edit or delete any of their own ads from their dashboard. Edit pre-populates the form with existing values and supports replacing images. Delete removes the ad from the database and all associated images from Cloudinary.

**Builds:**
- `client/pages/EditAdPage.tsx` — Pre-populated edit form identical in structure to `CreateAdPage`; loads existing ad data on mount; supports adding or removing images within the 5-image limit
- `client/api/ads.ts` — `updateAd`, `deleteAd`, `getAdById` fetch functions added
- `server/db/ads.ts` — Query functions: `updateAd`, `deleteAd`, `getAdById`, `getAdImagesByAdId`, `deleteAdImages`
- `server/services/ads.ts` — `updateAd` (handles Cloudinary image replacements), `deleteAd` (deletes Cloudinary assets first, then database row)
- `server/controllers/ads.ts` — `updateAd`, `deleteAd`
- `server/routes/ads.ts` — `PUT /api/ads/:id`, `DELETE /api/ads/:id` (both check ownership; return `403` if `owner_id` does not match)

**Visible result:** From the dashboard, a user can click Edit on one of their ads, change any field or swap images, and save. The updated ad reflects the changes immediately. A user can click Delete, confirm, and the ad disappears from the dashboard. Attempting to edit or delete another user's ad via the API returns `403`.

**Dependencies:** Unit 3 complete.

---

## Unit 5 — Ad Feed with Search and Category Filter

**What it builds:**
The main public feed page where all logged-in users can browse every ad on the platform. The feed is sorted newest-first by default and supports filtering by category and searching by keyword across titles and descriptions.

**Builds:**
- `client/pages/FeedPage.tsx` — Displays all ads newest-first using `AdCard`; includes a category filter sidebar/dropdown and a keyword search input; updates results as filters change
- `client/components/CategoryFilter.tsx` — Predefined category list rendered as filter buttons; "All" clears the filter
- `client/components/SearchBar.tsx` — Keyword input with debounce; fires query on input change
- `client/api/ads.ts` — `getAds(params: { category?, search? })` fetch function added
- `client/hooks/useAds.ts` — `useFeed` hook with category and search state
- `server/db/ads.ts` — `getAds` query function using `ILIKE` for keyword search and `WHERE category = $1` for category filter, ordered by `created_at DESC`
- `server/controllers/ads.ts` — `getAds` (reads `category` and `search` from query params)
- `server/routes/ads.ts` — `GET /api/ads` (protected; accepts `?category=` and `?search=` query params)

**Visible result:** A logged-in user can navigate to the home feed and see all ads. Selecting a category filters the feed to that category only. Typing in the search bar filters ads by keyword in real time. Clearing both shows all ads again.

**Dependencies:** Unit 3 complete (ads must exist to display).

---

## Unit 6 — Ad Detail Page

**What it builds:**
The full ad detail page shown when a user clicks any ad card. Displays all ad fields, the full image gallery as a navigable carousel, the poster's contact information, and the reviews section (populated in Unit 7). Also adds the navigation link from the feed to the detail page.

**Builds:**
- `client/pages/AdDetailPage.tsx` — Displays title, description, category, price, location, contact info, image gallery, poster profile summary (name + photo), and a reviews section (empty state for now)
- `client/components/ImageGallery.tsx` — Image carousel supporting up to 5 images with prev/next navigation
- `client/api/ads.ts` — `getAdById` fetch function
- `client/hooks/useAds.ts` — `useAd(id)` hook
- `AdCard` updated to link to `/ads/:id`
- `server/db/ads.ts` — `getAdById` query function joining `ads`, `ad_images`, and `users` (for poster name and photo)
- `server/controllers/ads.ts` — `getAdById`
- `server/routes/ads.ts` — `GET /api/ads/:id` (protected)

**Visible result:** Clicking any ad card on the feed or dashboard opens a full detail page with all fields, a working image carousel, and the poster's profile info. The reviews section shows an empty state with a "Be the first to review" prompt.

**Dependencies:** Unit 5 complete.

---

## Unit 7 — Reviews, Ratings, and Email Notifications

**What it builds:**
The full review system on the ad detail page. Any logged-in user can leave a star rating and optional written review on any ad they do not own. The ad owner receives an email notification when a new review is posted. Reviews are displayed on the ad detail page sorted newest-first.

**Builds:**
- `client/components/ReviewForm.tsx` — Star rating selector (1–5) + text input + submit button; hidden if the current user owns the ad
- `client/components/ReviewList.tsx` — Sorted list of reviews showing reviewer name, photo, star rating, text, and date
- `client/api/reviews.ts` — `postReview`, `getReviewsByAdId` fetch functions
- `client/hooks/useReviews.ts` — `useReviews(adId)` hook
- `AdDetailPage` updated to render `ReviewForm` and `ReviewList`
- `server/db/reviews.ts` — Query functions: `insertReview`, `getReviewsByAdId`, `deleteReview`
- `server/db/ads.ts` — `getAdOwnerEmail` query function (fetches owner email for notification)
- `server/utils/resend.ts` — Resend client initialised; `sendReviewNotificationEmail` helper function
- `server/services/reviews.ts` — `createReview` (validates reviewer ≠ ad owner, inserts review, calls `sendReviewNotificationEmail` non-blockingly)
- `server/controllers/reviews.ts` — `postReview`, `getReviews`
- `server/routes/reviews.ts` — `POST /api/reviews`, `GET /api/reviews?adId=` (both protected)
- Backend returns `403` if `reviewer_id === ad owner_id`

**Visible result:** On an ad detail page the current user does not own, a review form appears. Submitting a star rating and text saves the review, which immediately appears in the review list. The ad owner receives an email notification at their registered address. Attempting to review your own ad shows no form and returns `403` if tried via the API directly.

**Dependencies:** Unit 6 complete. Resend credentials in `.env`.

---

## Unit 8 — Admin Panel

**What it builds:**
A protected admin panel accessible only to users with `is_admin = true` in the database. Admins can view all ads, all reviews, and all users — and delete or ban any of them. Non-admin users attempting to access `/admin` are redirected.

**Builds:**
- `client/pages/AdminPage.tsx` — Three tabbed sections: All Ads, All Reviews, All Users; each row has a delete/ban action button; confirms before destructive actions
- `client/components/AdminRoute.tsx` — Route guard that checks `is_admin` from the user profile; redirects non-admins to the feed
- `client/api/admin.ts` — `adminGetAds`, `adminDeleteAd`, `adminGetReviews`, `adminDeleteReview`, `adminGetUsers`, `adminBanUser` fetch functions
- `server/middleware/requireAdmin.ts` — Checks `is_admin = true` in PostgreSQL; returns `403` if false
- `server/db/users.ts` — `getAllUsers`, `banUser` query functions added
- `server/db/ads.ts` — `getAllAds` query function added
- `server/db/reviews.ts` — `getAllReviews` query function added
- `server/services/admin.ts` — `adminDeleteAd` (Cloudinary cleanup + DB delete), `adminDeleteReview`, `adminBanUser`
- `server/controllers/admin.ts` — All admin action handlers
- `server/routes/admin.ts` — `GET /api/admin/ads`, `DELETE /api/admin/ads/:id`, `GET /api/admin/reviews`, `DELETE /api/admin/reviews/:id`, `GET /api/admin/users`, `POST /api/admin/users/:id/ban` (all protected by `requireAuth` + `requireAdmin`)

**Visible result:** Navigating to `/admin` as an admin shows three tabs listing all platform content. An admin can delete any ad (it disappears from the feed immediately), delete any review (it disappears from the ad detail page), and ban any user (the banned user's next API request returns `403`). A non-admin hitting `/admin` is redirected to the feed.

**Dependencies:** Unit 7 complete. Admin flag set manually in the database for at least one test user.

---

## Unit 9 — Production Deployment

**What it builds:**
The live, publicly accessible deployment of the platform. The Express backend and PostgreSQL database are deployed to Render. The React frontend is deployed to Vercel. All production environment variables are configured. All migrations are applied to the production database. Every feature from Units 1–8 is verified working at the live URL.

**Builds:**
- Render web service configured for the Express backend with all production environment variables set
- Render PostgreSQL database with all four migrations applied
- Vercel project configured for the React frontend with production `VITE_API_URL` and Clerk public key set
- CORS configured on the Express server to allow requests from the Vercel frontend URL
- End-to-end smoke test of all success criteria from `project-overview.md` on the live URL

**Visible result:** The platform is live at a public Vercel URL. A brand new user can sign up, create a profile, post an ad with images, see it in the feed, receive a review, and an admin can moderate — all in production with no local servers running.

**Dependencies:** Unit 8 complete. All five external service accounts (Clerk, Cloudinary, Render, Resend, Vercel) active and provisioned.
