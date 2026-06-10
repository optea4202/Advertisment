# Project Overview — Advertisement Platform

## Overview

This is a web-based advertisement platform where registered users can create an account, set up a personal profile, and publish advertisements for their own companies, stores, or services. The platform is gated behind authentication — only logged-in users can view or interact with any content. Each user can post multiple advertisements, each containing a title, description, up to five uploaded images, a category, a price, a location, and contact information. Other logged-in users can browse the full advertisement feed, filter by category, search by keyword, and leave star ratings with written reviews on any ad. An admin role allows designated users to moderate the platform by deleting ads, removing reviews, and banning accounts. Email notifications alert ad owners when a new review is posted on one of their advertisements.

---

## Goals

1. Build a secure, authentication-gated advertisement platform where only registered users can access content.
2. Allow each user to create and manage multiple advertisement posts from a personal dashboard.
3. Provide a browsable, searchable, and filterable feed of all advertisements posted by all users.
4. Enable users to leave star ratings and written reviews on advertisements.
5. Notify advertisement owners by email when a new review is posted on their ad.
6. Provide an admin panel that allows designated administrators to delete ads, delete reviews, and ban users.
7. Store all data in a structured PostgreSQL relational database with a clearly defined schema.
8. Keep all infrastructure costs at zero during the initial build using free-tier services.

---

## Core User Flow (Start to Finish)

1. **Land on the platform** — An unauthenticated visitor is redirected to the login/signup page. No content is visible without an account.
2. **Create an account** — The user registers using an email address and password, or signs in with their Google account via OAuth. Authentication is handled by Clerk.
3. **Complete profile setup** — On first login, the user fills in their profile: username, profile photo (uploaded to Cloudinary), phone number, email, and a short bio.
4. **Arrive at the dashboard** — The user lands on their personal dashboard, which displays a chronological list (newest first) of all ads they have posted.
5. **Create a new advertisement** — The user clicks "Post Ad" and fills out the ad form: title, description, up to 5 images (uploaded to Cloudinary), category (from a predefined list or "Other"), price, location, and contact information.
6. **Ad publishes instantly** — On submission, the ad is saved to the PostgreSQL database and immediately appears in the public feed. No approval step is required.
7. **Browse the feed** — The user navigates to the main feed, which displays all ads from all users sorted newest-first. They can filter by category or use the keyword search bar to find specific ads.
8. **View an ad** — The user clicks on an ad to open the detail page, which shows all fields, the full image gallery, and all existing reviews with star ratings.
9. **Leave a review** — The user submits a star rating (1–5) and an optional written review on another user's ad. The ad owner receives an email notification that a new review has been posted.
10. **Manage own ads** — From their dashboard, the user can edit or delete any of their own ads at any time. Ads remain live indefinitely until manually deleted.
11. **Admin moderation** (admin users only) — An admin logs in and accesses the `/admin` panel. From there, they can delete any ad on the platform, delete any review, or ban a user account.

---

## Features

### Authentication
- Email and password registration and login
- Google Sign-In via OAuth
- Session management using Clerk JWT tokens
- Protected routes — all content requires authentication
- Banned user accounts are blocked at the API middleware level

### User Profile
- One profile per user account
- Fields: username, profile photo, phone number, email, bio
- Profile photo uploaded directly to Cloudinary

### Advertisement Management
- Create, edit, and delete ads from a personal dashboard
- Dashboard displays the user's own ads sorted newest-first
- Each ad supports: title, description, category, price, location, contact info, and up to 5 images
- Images uploaded to Cloudinary; up to 5 images per ad displayed as a gallery
- Ads publish instantly with no moderation queue
- Ads remain live until the owner manually deletes them

### Browsing & Discovery
- Public feed showing all ads from all users, sorted newest-first by default
- Filter by category using a predefined category list
- Keyword search across ad titles and descriptions (PostgreSQL full-text or `ILIKE` query)

### Reviews & Ratings
- Any logged-in user can post a star rating (1–5) and written review on any ad
- Reviews are displayed on the ad detail page
- Ad owners cannot delete reviews on their own ads — only admins can

### Email Notifications
- Ad owners receive an email when a new review is posted on one of their ads
- Emails sent via Resend from the Node.js backend

### Admin Panel
- Accessible only to users with `is_admin = true` in the database
- Admin can delete any ad on the platform
- Admin can delete any review on the platform
- Admin can ban any user account, preventing further access

---

## In Scope

- User registration and login (email/password + Google Sign-In via Clerk)
- User profile creation with photo upload
- Full CRUD (create, read, update, delete) for advertisements
- Multi-image upload per ad (up to 5) via Cloudinary
- Predefined ad categories with an "Other" fallback
- Ad browsing feed with category filter, keyword search, and newest-first sorting
- Ad detail page with image gallery and reviews section
- Star rating and written review system
- Email notification to ad owner when a new review is posted (via Resend)
- Admin panel: delete ads, delete reviews, ban users
- PostgreSQL relational database with a structured schema
- Node.js + Express REST API backend
- React + Vite frontend
- Deployment: frontend on Vercel, backend + database on Render

---

## Out of Scope

- Direct messaging or chat between users
- In-app or push notifications (browser or mobile)
- Ad view or click analytics
- Featured, promoted, or paid advertisement placements
- Payment processing or in-platform transactions
- Mobile application (iOS or Android)
- User-to-user following or social graph features
- Ad expiry or automatic renewal system
- Password reset via custom email (handled entirely by Clerk)
- Multi-language or internationalisation support

---

## Success Criteria

The platform is considered **done** when all of the following are true:

1. **Authentication works end-to-end** — A new user can sign up with email/password or Google, complete their profile, and log in on a subsequent visit without errors.
2. **Ad posting works** — A logged-in user can create an ad with all required fields and upload up to 5 images. The ad appears in the public feed immediately after submission.
3. **Feed browsing works** — A logged-in user can view all ads, filter the feed by at least one category, search by keyword, and receive accurate results sorted newest-first.
4. **Ad management works** — A user can edit the content of their own ad and delete it. Deleted ads are removed from the feed immediately.
5. **Reviews work** — A logged-in user can submit a star rating and written review on another user's ad. The review appears on the ad detail page.
6. **Email notifications work** — When a review is posted, the ad owner receives an email notification at their registered email address within 60 seconds.
7. **Admin panel works** — An admin user can log in, access `/admin`, delete an ad, delete a review, and ban a user. A banned user attempting to log in is denied access.
8. **Access control is enforced** — An unauthenticated visitor attempting to access any page other than login/signup is redirected to the login page.
9. **No critical data is lost** — Deleting a user cascades correctly and removes their ads, images, and reviews from the database and Cloudinary.
10. **All external services are on free tiers** — Clerk, Cloudinary, Render, Resend, and Vercel are all operating within their free-tier limits at launch.
