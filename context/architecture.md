# Architecture — Advertisement Platform

---

## Stack Table

| Layer | Technology | Role |
|---|---|---|
| **Frontend** | React + Vite | Renders the UI, handles routing, manages client-side state, communicates with the backend via REST API calls |
| **Backend** | Node.js + Express | Exposes a REST API, enforces authentication and authorization, contains all business logic, coordinates between database, Cloudinary, and Resend |
| **Database** | PostgreSQL (hosted on Render) | Stores all structured, relational data — users, ads, images metadata, and reviews |
| **Authentication** | Clerk | Issues and manages JWTs for email/password and Google OAuth sign-in; the backend verifies Clerk tokens on every protected request |
| **File Storage** | Cloudinary | Stores all uploaded images (ad photos and profile photos); returns a permanent CDN URL after each upload |
| **Email** | Resend | Sends transactional email notifications (e.g., new review alert) triggered by the Express backend |
| **Frontend Hosting** | Vercel | Serves the compiled React + Vite static bundle; handles environment variables for API base URL and Clerk public key |
| **Backend Hosting** | Render | Hosts the Express server as a web service; hosts the PostgreSQL database as a managed instance |

---

## System Boundaries

Each top-level folder owns a single responsibility. No folder should contain logic that belongs to another.

```
/
├── client/               # React + Vite frontend — all UI, routing, and API calls
│   ├── src/
│   │   ├── pages/        # One file per route (Home, Login, Dashboard, AdDetail, Admin)
│   │   ├── components/   # Reusable UI components (AdCard, ReviewForm, ImageGallery, etc.)
│   │   ├── hooks/        # Custom React hooks (useAuth, useAds, useReviews)
│   │   ├── api/          # Axios or fetch wrappers — one file per backend resource
│   │   └── context/      # React context providers (AuthContext, etc.)
│
├── server/               # Node.js + Express backend — all business logic and data access
│   ├── routes/           # Express route definitions (one file per resource: users, ads, reviews)
│   ├── controllers/      # Request handlers — call services and return responses
│   ├── services/         # Business logic (e.g., createAd, postReview, sendReviewEmail)
│   ├── middleware/        # Auth verification (Clerk JWT), role checks, error handling
│   ├── db/               # PostgreSQL client setup and raw SQL query functions
│   ├── config/           # Environment variable loading and validation
│   └── utils/            # Shared helpers (Cloudinary client, Resend client, etc.)
│
├── db/                   # Database schema and migrations
│   └── migrations/       # Ordered SQL migration files (001_create_users.sql, etc.)
│
└── project-overview.md
└── architecture.md
```

### Boundary Rules
- The **frontend never connects directly to PostgreSQL or Cloudinary**. All data operations go through the Express API.
- The **frontend never sends raw JWT tokens to Cloudinary or Resend**. These calls are made server-side.
- **Controllers never contain raw SQL**. SQL lives in `db/` query functions only.
- **Routes never contain business logic**. They delegate immediately to controllers.

---

## Storage Model

### PostgreSQL — Structured Relational Data

Everything that needs querying, filtering, joining, or enforcing integrity lives in PostgreSQL.

| Table | What it stores |
|---|---|
| `users` | Account identity, profile fields, admin flag, banned flag, Clerk user ID |
| `ads` | Ad content fields (title, description, category, price, location, contact info), owner reference, timestamps |
| `ad_images` | Cloudinary CDN URLs for each ad image, display order, foreign key to `ads` |
| `reviews` | Star rating, review text, reviewer reference, ad reference, timestamp |

**PostgreSQL is the source of truth for all application data.**

### Cloudinary — Binary File Storage

Cloudinary stores files only. No application logic depends on Cloudinary alone.

| What is stored | Details |
|---|---|
| Ad images | Up to 5 images per ad, uploaded at ad creation or edit time |
| Profile photos | One image per user, uploaded at profile setup or edit time |

- After a successful upload, Cloudinary returns a permanent CDN URL.
- That URL is immediately saved into PostgreSQL (`ad_images.cloudinary_url` or `users.photo_url`).
- **Cloudinary is never queried directly by the frontend or backend for listing or searching.** All lookups go through PostgreSQL.
- When an ad or user is deleted, the backend must delete the corresponding Cloudinary assets using the Cloudinary API before removing the database record.

### No Cache Layer (Version 1)

There is no Redis or in-memory cache in Version 1. PostgreSQL handles all read queries directly. A cache layer may be added in Version 2 if feed query performance becomes a bottleneck.

---

## Auth and Access Model

### How Authentication Works

1. The user signs in on the frontend using Clerk's UI components (email/password or Google OAuth).
2. Clerk issues a signed JWT token and stores it client-side.
3. The frontend attaches the JWT as a `Bearer` token on every API request in the `Authorization` header.
4. The Express backend validates the JWT on every protected route using Clerk's Node.js SDK middleware.
5. If the token is missing, expired, or invalid, the backend returns `401 Unauthorized`.
6. If the token is valid, the backend extracts the `clerk_id` and looks up the user in PostgreSQL to get their role and ban status.

### Roles and Permissions

| Role | How it is set | Permissions |
|---|---|---|
| **Guest** | No JWT present | Login and signup pages only; all other routes return `401` |
| **User** | Valid JWT + `is_admin = false` + `is_banned = false` | Browse feed, view ads, create/edit/delete own ads, post reviews |
| **Admin** | Valid JWT + `is_admin = true` | All user permissions + delete any ad, delete any review, ban any user |
| **Banned User** | Valid JWT + `is_banned = true` | All API requests return `403 Forbidden` regardless of other flags |

### Ownership Rules

- A user may only **edit or delete their own ads**. The backend checks `ads.owner_id = requesting_user.id` before allowing write operations.
- A user may **not delete reviews posted on their own ads**. Only the reviewer or an admin can delete a review.
- An admin's `is_admin` flag is set manually in the database. There is no UI endpoint to self-promote to admin.

---

## Background Tasks and AI Models

### Version 1 — No AI or Persistent Background Workers

There are no AI models, machine learning features, or scheduled background jobs in Version 1.

### Email Notification (Synchronous, Triggered)

Email notifications are **not** background jobs. They are triggered synchronously within the review creation request:

```
POST /api/reviews
  → Validate input
  → Insert review into PostgreSQL
  → Look up ad owner's email from PostgreSQL
  → Call Resend API to send notification email
  → Return 201 Created to client
```

If the Resend API call fails, the review is still saved and a non-blocking error is logged. Email failure does not roll back the review creation.

### Future Considerations (Out of Scope for Version 1)
- A job queue (e.g., BullMQ + Redis) for reliable async email delivery
- AI-assisted ad categorisation or content moderation
- Scheduled jobs for orphaned Cloudinary asset cleanup

---

## Invariants

These are rules the codebase must **never** violate. They are non-negotiable and must be enforced at the API layer regardless of client behaviour.

### 1. No unauthenticated access to application data
Every API route that reads or writes application data must be protected by the Clerk JWT verification middleware. A missing or invalid token must always return `401`. There are no exceptions. The frontend enforcing login state is not sufficient — the backend must independently verify every request.

### 2. Ownership must be verified server-side before any write operation
Before the backend processes an edit or delete on an ad or review, it must query PostgreSQL to confirm that the requesting user's `id` matches the `owner_id` or `reviewer_id` of the resource. The frontend sending the correct user ID is not sufficient verification.

### 3. Banned users must be denied access at the API level
If `users.is_banned = true`, every API request from that user must return `403 Forbidden`, even if their Clerk JWT is valid. Banning must have immediate effect — it cannot rely on token expiry.

### 4. Cloudinary assets must be deleted when their parent record is deleted
When an ad is deleted, all associated images must be deleted from Cloudinary before the database row is removed. When a user is deleted, their profile photo must be deleted from Cloudinary. Orphaned assets waste storage and represent a data leak. This logic lives in the service layer, not the route layer.

### 5. An ad may have a maximum of 5 images
The backend must enforce this limit at the point of ad creation and edit. If a request includes more than 5 images, the backend must reject it with `400 Bad Request`. The frontend enforcing this limit is not sufficient.

### 6. A user may not review their own advertisement
Before inserting a review, the backend must verify that `reviews.reviewer_id ≠ ads.owner_id`. If they match, the request must return `403 Forbidden`. This prevents self-promotion and fake ratings.

### 7. Admin status is never granted through a public API endpoint
There is no `POST /api/users/make-admin` or equivalent route. The `is_admin` flag is set only by direct database access. Exposing admin promotion through the API would be a critical security vulnerability.

### 8. Raw SQL errors are never exposed to the client
If a database query fails, the backend must log the full error server-side and return a generic `500 Internal Server Error` response to the client. PostgreSQL error messages, table names, and column names must never appear in API responses.
