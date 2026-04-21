# ILWU Local 4 Golf Tournament Registration System

## Original Problem Statement
Build a website for registration of a golf tournament for ILWU Local 4. Location: Club Green Meadows. Event Date: September 3, 2026. Early bird pricing $125/player before June 20, regular $150 after. Max 18 teams of 4 players. Admin dashboard with payment tracking, check-in system, leaderboard, and print roster.

## What's Been Implemented

### Phase 1 (Dec 2025)
- Landing page with ILWU branding (Navy/Yellow)
- Individual + team registration with random team assignment (1-18)
- Confirmation page, admin dashboard with CSV export
- Gmail SMTP email confirmations
- Player/team deletion from admin

### Phase 2 (Feb 2026)
- Event date: September 3, 2026
- Early bird pricing: $125 before June 20, $150 after (dynamic)
- Extras & Prizes section (Long Drive, Closest to Pin, Mulligans, Raffle)
- Team prizes: 1st, 2nd, 3rd, Last Place
- Lunch included in event details
- Join existing team via captain dropdown
- Token-based admin auth (no browser popup)
- Local ILWU logo, Vercel deployment config

### Phase 3 (Feb 2026)
- Payment status tracking (paid/unpaid per player)
- Mark as Paid toggles + Mark All Paid per team
- Payment confirmation email sent when marked as paid
- Paid/Unpaid stats on dashboard
- Payment status in CSV exports

### Phase 4 (Feb 2026)
- **Check-In System** at `/admin/checkin` — search, stats, per-player toggle
- Check-in toggles also on main admin dashboard team cards
- **Leaderboard** at `/leaderboard` — public, podium for top 3, full standings, last place prize
- Team score input on admin dashboard team cards
- **Print Roster** — opens printer-friendly view of all teams
- Leaderboard button on landing page hero

## Tech Stack
- Frontend: React + Tailwind CSS + Shadcn UI
- Backend: FastAPI + MongoDB Atlas
- Auth: Token-based (JSON login)
- Email: Gmail SMTP
- Hosting: Vercel (frontend + serverless Python API)
- Database: MongoDB Atlas

## Prioritized Backlog
### P1
- Zeffy payment integration (when user creates account)
- Vercel deployment sync (push latest features)

### P2
- Competition results (Long Drive, Closest to Pin winners)
- Raffle winner tracking

### P3
- Player self-service (check registration status)
- Event day announcements/notifications

## Admin Credentials
- Username: admin
- Password: ilwu4golf2024
