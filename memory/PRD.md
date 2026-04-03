# ILWU Local 4 Golf Tournament Registration System

## Original Problem Statement
Build a website for registration of a golf tournament for ILWU Local 4. Location: Club Green Meadows. Price: $150 per player, $600 a team. Registration includes first/last name, phone, email, association (local number or friend of member). Random team assignment (1-18), max 4 players per team, max 18 teams. Individual signups assigned to teams in order, first player is captain.

## User Personas
- **Union Members**: ILWU Local 4 members registering individually or with teams
- **Friends of Members**: Non-members invited to participate
- **Admin**: Tournament organizer managing registrations

## Core Requirements (Static)
- Individual registration with auto team assignment
- Team registration (1-4 players)
- Random team numbers (1-18, no reuse)
- Captain designation (first player)
- Payment info display (Credit Union/Hall)
- Admin dashboard with password protection

## What's Been Implemented

### Phase 1 (Dec 2025)
- Landing page with ILWU branding (Navy/Yellow)
- Individual registration form with team auto-assignment
- Team registration form (1-4 players)
- Confirmation page with team number
- Admin login (admin/ilwu4golf2024)
- Admin dashboard: stats, teams view, players view
- Delete players/teams functionality
- Payment notice displayed throughout
- CSV export for registrations and teams
- Gmail SMTP email confirmations

### Phase 2 (Feb 2026)
- Event date set: September 3, 2026
- Early bird pricing: $125/player before June 20, 2026; $150/player after
- Dynamic pricing across all pages (landing, registration, confirmation, emails)
- Early Bird Special banner on landing page
- Extras & Prizes section: Long Drive Competition, Closest to Pin, Mulligans
- Team Prizes section: 1st, 2nd, 3rd, and Last Place

## Tech Stack
- Frontend: React + Tailwind CSS + Shadcn UI
- Backend: FastAPI + MongoDB
- Auth: HTTP Basic Auth for admin
- Email: Gmail SMTP

## Prioritized Backlog
### P0 (Done)
- All core registration features
- Event date and pricing updates
- Extras & Prizes section

### P1 (Future)
- Custom deployment assistance (Vercel/Railway)
- Download external ILWU logo to local assets

### P2 (Nice to Have)
- Team roster printout
- Player check-in system
- Results/leaderboard after event

## Admin Credentials
- Username: admin
- Password: ilwu4golf2024
