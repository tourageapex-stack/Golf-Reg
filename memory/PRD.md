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

## What's Been Implemented (Dec 2025)
- ✅ Landing page with ILWU branding (Navy/Yellow)
- ✅ Individual registration form with team auto-assignment
- ✅ Team registration form (1-4 players)
- ✅ Confirmation page with team number
- ✅ Admin login (admin/ilwu4golf2024)
- ✅ Admin dashboard: stats, teams view, players view
- ✅ Delete players/teams functionality
- ✅ Payment notice displayed throughout

## Tech Stack
- Frontend: React + Tailwind CSS + Shadcn UI
- Backend: FastAPI + MongoDB
- Auth: HTTP Basic Auth for admin

## Prioritized Backlog
### P0 (Done)
- All core registration features

### P1 (Future)
- Export registrations to CSV
- Email notifications
- Tournament date announcement feature

### P2 (Nice to Have)
- Team roster printout
- Player check-in system
- Results/leaderboard after event

## Admin Credentials
- Username: admin
- Password: ilwu4golf2024
