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

### Phase 5 (Feb 2026)
- Credit Union payment note: instructs users to have the Credit Union add a note with the payer's name (on Landing, Individual Reg, Team Reg, Confirmation)
- "Online Payment Methods — Coming Soon" prominent highlighted banner across all four pages
- Tee-off schedule: "Registration opens 7:00 AM · Shotgun tee off 8:00 AM" shown on Landing, Confirmation, and included in confirmation emails
- "Add to Calendar" functionality: new `GET /api/calendar.ics` endpoint, .ics attached to registration emails, buttons on Landing and Confirmation pages
- Printable Event Flyer at `/flyer` (and `/share`): letter-size, QR code to `https://localfore.vercel.app/`, Download PDF button (html2pdf.js), print-optimized CSS
- Live Spots Counter on Flyer page (hidden on print/PDF)

### Phase 6 (Feb 2026)
- **Max teams raised from 18 → 25**
- Smart team-number + starting-hole assignment:
  - Teams 1-18: random team number 1-18, starting hole = team number (one team per hole for shotgun start)
  - Teams 19-25: random team number 19-25, starting hole random 1-6 (second team on that hole)
- `starting_hole` now returned in registration response, team list, admin dashboard (Hole X badge), confirmation page (hole pill), and confirmation emails (text + HTML)
- Applied to both `/app/backend/server.py` and `/app/api/index.py`

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
