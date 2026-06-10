# Code Standards — Advertisement Platform

These standards apply to all code written in this project across both the `client/` and `server/` directories. Every rule here exists to prevent a specific class of bug, security issue, or maintenance problem.

---

## General

- **Keep every module small and single-purpose.** A file that does more than one thing is a file that should be split. A route file handles routing. A service file handles logic. A query file handles SQL. Never combine these.
- **Fix root causes, do not layer workarounds.** If a bug exists because the data model is wrong, fix the data model — do not add a conditional to patch over it.
- **Do not mix unrelated concerns in one component or route.** A component that fetches data, formats it, and renders UI is three components. A route that validates input, runs business logic, and sends email is a route that calls three functions.
- **Delete dead code immediately.** Commented-out code, unused variables, and unreachable branches are not version history — that is what Git is for.
- **Name things for what they do, not how they work.** `createAd` is better than `insertAdRow`. `sendReviewNotification` is better than `callResend`.
- **Do not hardcode secrets or environment-specific values.** All API keys, database URLs, and service credentials must live in `.env` files and be loaded through the config module in `server/config/`.

---

## TypeScript

- **Strict mode is required in both `client/` and `server/`.** `tsconfig.json` must include `"strict": true`. No exceptions.
- **Never use `any`.** Use explicit interfaces, narrowly scoped types, or `unknown` with a type guard. If you reach for `any`, it means the type needs to be defined — define it.
- **Validate all external input at system boundaries before trusting it.** Request bodies, query parameters, Clerk token payloads, and Cloudinary webhook data are all `unknown` until validated. Use a validation library (e.g., Zod) at every entry point.
- **Define a shared type for every API response shape.** If the frontend and backend disagree on a response shape, it should be a TypeScript error — not a runtime bug.
- **Do not use type assertions (`as SomeType`) to silence errors.** If a cast is genuinely necessary, add a comment explaining why.
- **Prefer interfaces over type aliases for object shapes.** Use `type` only for unions, intersections, or primitives.

---

## React (Client)

- **One component per file.** Do not export multiple components from the same file.
- **Keep components focused on rendering.** Data fetching belongs in custom hooks (`hooks/`), not inside component bodies.
- **Use custom hooks to encapsulate all API calls.** The component calls `useAds()` — not `fetch('/api/ads')` directly.
- **Never access `localStorage` or `document` inside a component body without a `useEffect`.** This causes hydration and SSR issues.
- **Do not pass raw Clerk JWTs as props.** Use the Clerk React hooks (`useAuth`, `useUser`) to access auth state. Do not thread tokens manually through the component tree.
- **All pages live in `pages/`.** All reusable UI pieces live in `components/`. A page is not reusable. A component is.
- **Prop types must always be explicitly typed.** No implicit `any` props. Define a `Props` interface above each component.

---

## Express (Server)

- **Every protected route must run the auth middleware before the controller.** Auth is never optional on a protected route.
- **Controllers must not contain business logic.** A controller receives a request, calls a service function, and returns a response. If a controller is longer than 20 lines, it is doing too much.
- **Services must not contain SQL.** A service calls query functions from `db/`. It never constructs or executes SQL strings directly.
- **Route files must not contain inline logic.** Route files define paths and attach middleware and controllers — nothing else.
- **Every route must have an explicit HTTP method.** Never use `app.all()` or `router.use()` as a substitute for defining methods clearly.
- **Always call `next(error)` to pass errors to the global error handler.** Never call `res.status(500).json(...)` inline in a controller.

---

## Styling

- **Use CSS custom properties (variables) for all colours, spacing, and typography values.** No hardcoded hex values, pixel values, or font names outside of `:root`.
- **Define all design tokens in a single `variables.css` file** imported at the root of the application. If a token does not exist, add it there — do not inline the value.
- **Never use inline `style` attributes** unless the value is genuinely dynamic and cannot be expressed with a class.
- **Class names must be descriptive and follow a consistent convention (BEM or plain descriptive names).** Avoid class names like `.wrapper2`, `.box`, or `.thing`.
- **Do not nest CSS more than two levels deep.** Deep nesting is a sign that the component should be split.
- **All interactive elements must have a visible focus state.** Do not write `outline: none` without replacing it with a custom focus style.

---

## API Routes

- **Validate and parse all request input before any logic runs.** Use Zod schemas to parse `req.body`, `req.params`, and `req.query` at the top of every controller. Return `400 Bad Request` immediately if validation fails.
- **Enforce authentication before any route logic executes.** The Clerk JWT middleware must run first on every protected route.
- **Enforce ownership before any mutation.** Before updating or deleting a resource, query the database to confirm the requesting user owns it. Return `403 Forbidden` if they do not.
- **Return consistent response shapes across all routes.**
  - Success: `{ data: <payload> }`
  - Error: `{ error: { message: string, code?: string } }`
- **Never expose internal error details to the client.** Log full errors server-side. Return only a generic message in the API response.
- **Use correct HTTP status codes.** `200` for success, `201` for creation, `400` for bad input, `401` for unauthenticated, `403` for unauthorised, `404` for not found, `500` for server error.
- **Limit image uploads to 5 per ad at the route level.** Reject any request exceeding this before passing to the service.

---

## Data and Storage

- **Structured, queryable data belongs in PostgreSQL.** User profiles, ad fields, review content, and image URLs are all structured data. They live in the database.
- **Binary files belong in Cloudinary.** Images are never stored in the database — not as base64, not as blobs. Only the Cloudinary CDN URL is stored in PostgreSQL.
- **Delete Cloudinary assets before deleting the database record.** The database row must not be removed first or the Cloudinary reference is lost permanently.
- **Never store secrets or credentials in the database.** Clerk manages authentication credentials. The database stores only the `clerk_id` as a reference.
- **All database queries must use parameterised statements.** Raw string interpolation into SQL queries is prohibited. It is a SQL injection vulnerability.
- **Schema changes must be written as migration files in `db/migrations/`.** Never alter the database schema manually in production. Every change must be reproducible and version-controlled.
- **Do not store large text content (e.g., full HTML, base64 images) directly in database columns.** PostgreSQL `TEXT` columns are for human-readable content, not binary payloads.

---

## File Organisation

### `client/src/`
- `pages/` — One file per application route (e.g., `HomePage.tsx`, `AdDetailPage.tsx`, `DashboardPage.tsx`, `AdminPage.tsx`). Pages are not reused.
- `components/` — Reusable UI components scoped to a single visual concern (e.g., `AdCard.tsx`, `ReviewForm.tsx`, `ImageGallery.tsx`, `CategoryFilter.tsx`).
- `hooks/` — Custom React hooks that encapsulate API calls and stateful logic (e.g., `useAds.ts`, `useReviews.ts`, `useAuth.ts`).
- `api/` — Thin fetch/Axios wrapper functions grouped by resource (e.g., `ads.ts`, `reviews.ts`, `users.ts`). No business logic here — just HTTP calls.
- `context/` — React context providers for global state (e.g., `AuthContext.tsx`).
- `styles/` — Global CSS files. `variables.css` defines all design tokens. `global.css` applies resets and base styles.
- `types/` — Shared TypeScript interfaces used across the frontend (e.g., `Ad.ts`, `User.ts`, `Review.ts`).

### `server/`
- `routes/` — Express router files, one per resource (e.g., `ads.ts`, `reviews.ts`, `users.ts`). Attach middleware and controllers only.
- `controllers/` — Request handler functions. Parse validated input, call services, return responses.
- `services/` — Business logic functions. Coordinate between query functions, Cloudinary, and Resend.
- `middleware/` — Reusable Express middleware (e.g., `requireAuth.ts`, `requireAdmin.ts`, `errorHandler.ts`).
- `db/` — PostgreSQL client initialisation and all SQL query functions. No logic beyond data access.
- `config/` — Load and validate all environment variables. Export a typed `config` object used throughout the server.
- `utils/` — Stateless helper functions and third-party client initialisations (e.g., `cloudinary.ts`, `resend.ts`).

### `db/`
- `migrations/` — Ordered SQL migration files named with a numeric prefix (e.g., `001_create_users.sql`, `002_create_ads.sql`). One migration per schema change.
