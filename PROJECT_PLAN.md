# Mentivara — Project Plan

## Goal
Build an AI-powered tutoring platform that connects curated tutors with ambitious students, combining live tutoring, AI study tools, exam prep, community, and mental wellbeing into one ecosystem.

## V1 Scope (MVP)
- User auth (register, login, password reset)
- Role-based system (admin, tutor, student, parent)
- Tutor application flow + admin approval
- Tutor profiles (photo, bio, qualifications, subjects, levels, exam boards, intro video)
- Tutor directory with search and filters
- Tutor availability calendar management
- Lesson booking + confirmation + Stripe payments
- Live classroom (WebRTC video/audio, chat, whiteboard, screen share)
- Lesson recording (auto-save)
- Student dashboard (upcoming lessons, past lessons)
- Parent dashboard (read-only progress view)
- Admin panel (user management, tutor approval)
- Email + push notifications
- React web app (responsive)
- React Native mobile app (iOS + Android)

## Out of Scope (V1)
- AI lesson packages (Phase 2)
- AI Copilot during lessons (Phase 2)
- Question bank + exam simulator (Phase 2)
- Knowledge Map (Phase 2)
- Study missions, XP, streaks (Phase 3)
- Tutor reels + competitions (Phase 3)
- Forum + study groups (Phase 3)
- Messaging system (Phase 3)
- Mental Dojo (Phase 4)
- AI Study Coach + Optimizer (Phase 4)
- Custom curriculum upload (Phase 2)

## Current Status: Not started

## Next Steps
1. **Initialize project structure** — Create Laravel API project, React web app (Vite), and React Native (Expo) app in the monorepo
2. **Set up auth system** — Laravel Sanctum auth with registration, login, role-based middleware for all four user roles
3. **Build tutor profile system** — Tutor model, profile CRUD API, tutor directory endpoint with search/filter

## Failed Approaches
(none yet)
