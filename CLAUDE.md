# Mentivara — AI-Powered Tutoring Platform

## Project Overview
**Name:** Mentivara
**Description:** AI-powered tutoring ecosystem connecting curated private tutors with ambitious students. Combines live tutoring, AI study tools, exam preparation, community, and mental wellbeing.
**Stack:** React (web) + React Native (mobile) + Laravel (API) + MySQL + Redis
**AI Provider:** Anthropic Claude API for all AI features

## Project Structure
```
mentivara/
├── api/                    # Laravel backend (API-only)
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   ├── Services/
│   │   └── Jobs/
│   ├── database/migrations/
│   ├── routes/api.php
│   └── tests/
├── web/                    # React web app (Vite + React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   └── styles/
│   └── tests/
├── mobile/                 # React Native app (Expo)
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── hooks/
│   │   └── services/
│   └── tests/
├── shared/                 # Shared types, constants, utils
├── docs/                   # Product specs, architecture docs
├── CLAUDE.md
├── PROJECT_PLAN.md
└── PRODUCT_SPEC.md
```

## Key Conventions
- **API:** RESTful, versioned under `/api/v1/`. JSON responses. Laravel API Resources for serialization.
- **Auth:** Laravel Sanctum for API tokens (supports both web SPA and mobile).
- **Naming:** snake_case for PHP, camelCase for JS/TS, PascalCase for React components.
- **Database:** Migrations for all schema changes. No raw queries — use Eloquent.
- **State:** Zustand for web, React Context + hooks for mobile (shared patterns where possible).
- **Styling:** Tailwind CSS for web, NativeWind or StyleSheet for mobile.
- **Testing:** PHPUnit for API, Vitest for web, Jest for mobile.

## Three-Tier Boundaries

### Always Do
- Run tests before committing
- Write migration for every DB change
- Validate all user input server-side
- Use Laravel Form Requests for validation
- Use API Resources for response formatting
- Write feature tests for new endpoints
- Keep controllers thin — business logic in Services
- Use environment variables for all secrets and config

### Ask First
- Adding new dependencies (composer or npm)
- Changing API contracts (breaking changes)
- Deleting files, tables, or columns
- Modifying auth or permission logic
- Infrastructure or hosting decisions
- Third-party service integrations

### Never Do
- Commit .env files or secrets
- Skip pre-commit hooks (--no-verify)
- Write raw SQL queries (use Eloquent)
- Store passwords in plain text
- Defer tests to "later"
- Push directly to main branch
- Install packages globally that should be local

## Agent Model Assignment
- **haiku** → file reading, searching, fact-gathering, simple lookups
- **sonnet** → writing code, tests, moderate refactoring, standard features
- **opus** → architecture decisions, security review, complex AI integrations, system design

## Active Plan
See `PROJECT_PLAN.md` for current development status.
See `PRODUCT_SPEC.md` for complete product specification.
