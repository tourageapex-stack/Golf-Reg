# ILWU Local 4 Golf Tournament Registration System

## Original Problem Statement
Build a website for registration of a golf tournament for ILWU Local 4. Location: Club Green Meadows. Event Date: September 3, 2026. Early bird pricing $125/player before June 20, regular $150 after. Registration includes first/last name, phone, email, association. Random team assignment (1-18), max 4 players per team, max 18 teams. Individual signups can join existing teams by selecting their captain. First player is captain. No external payment integration (Zeffy planned for future). Admin dashboard with payment tracking.

## What's Been Implemented

### Phase 1 (Dec 2025)
- Landing page with ILWU branding (Navy/Yellow)
- Individual + team registration with random team assignment
- Confirmation page, admin dashboard with CSV export
- Gmail SMTP email confirmations
- Player/team deletion from admin

### Phase 2 (Feb 2026)
- Event date: September 3, 2026
- Early bird pricing: $125 before June 20, $150 after (dynamic)
- Extras & Prizes section (Long Drive, Closest to Pin, Mulligans, Raffle Prizes)
- Team prizes: 1st, 2nd, 3rd, Last Place
- Lunch included in event details
- Join existing team via captain dropdown
- Token-based admin auth (no browser popup)
- Local ILWU logo asset
- Vercel deployment config (vercel.json, api/index.py)
- Removed Emergent badge, updated page title

### Phase 3 (Feb 2026)
- Payment status tracking (paid/unpaid per player)
- Admin "Mark as Paid" toggle per player (teams + players views)
- "Mark All Paid" button per team
- Paid/Unpaid stats cards on dashboard
- Payment status in both CSV exports (registrations + teams)
- Zeffy webhook endpoint ready (`/api/webhook/zeffy`)

## Tech Stack
- Frontend: React + Tailwind CSS + Shadcn UI
- Backend: FastAPI + MongoDB Atlas
- Auth: Token-based (JSON login)
- Email: Gmail SMTP
- Hosting: Vercel (frontend + serverless Python API)
- Database: MongoDB Atlas

## Prioritized Backlog
### P1
- Zeffy payment integration (when user creates Zeffy account)
- Vercel deployment env var fix for admin credentials

### P2
- Post-payment redirect from Zeffy back to site
- Zeffy webhook processing for automatic payment status updates

### P3
- Team roster printout
- Player check-in system
- Results/leaderboard after event

## Admin Credentials
- Username: admin
- Password: ilwu4golf2024
