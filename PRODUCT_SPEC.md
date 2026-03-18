# Mentivara — Complete Product Specification

---

## 1. Brand Identity

### Brand Meaning
**Menti** (from Latin *mentis* — mind) + **vara** (suggesting guardian/variable/vault). Mentivara = *guardian of the mind*. The name conveys intellectual growth, protection, and transformation.

### Brand Personality
- **Intelligent** — data-driven, precise, academically rigorous
- **Warm** — approachable, encouraging, never intimidating
- **Premium** — curated quality, not mass-market
- **Progressive** — AI-forward, modern learning science
- **Resilient** — building mental strength alongside academic skill

### Tone of Voice
- Confident but not arrogant
- Encouraging but not patronizing
- Clear and direct — no jargon overload
- Aspirational — "you can achieve this"
- Conversational with students, professional with parents

### Brand Values
1. **Excellence** — curated tutors, no compromises on quality
2. **Intelligence** — AI amplifies human teaching, never replaces it
3. **Growth** — academic and personal development together
4. **Trust** — safe learning environment, transparent progress
5. **Community** — learning is social, not isolated

### Tagline Ideas
- "Your mind, amplified."
- "Where brilliance is built."
- "Learn smarter. Grow stronger."
- "The intelligent way to learn."
- "Tutoring reimagined."

---

## 2. Logo Concept

### Logo Style
Minimal geometric wordmark with an abstract icon. The icon represents a mind expanding — a stylized "M" that forms an upward-opening shape suggesting growth, neural pathways, or an open book.

### Typography
- **Wordmark:** Inter or Plus Jakarta Sans — geometric, modern, highly legible
- **Headings:** Plus Jakarta Sans Bold / Semibold
- **Body:** Inter Regular / Medium
- **Code/Data:** JetBrains Mono (for any data displays)

### Color Palette

#### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Deep Indigo | `#1E1B4B` | Primary brand, headers, nav |
| Vivid Violet | `#7C3AED` | CTAs, active states, accents |
| Soft Lavender | `#EDE9FE` | Backgrounds, cards, highlights |

#### Secondary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Emerald | `#059669` | Success, progress, XP |
| Amber | `#D97706` | Warnings, streaks, badges |
| Rose | `#E11D48` | Errors, urgency |
| Sky | `#0EA5E9` | Info, links, AI features |

#### Neutral Colors
| Name | Hex | Usage |
|------|-----|-------|
| Slate 900 | `#0F172A` | Primary text |
| Slate 600 | `#475569` | Secondary text |
| Slate 300 | `#CBD5E1` | Borders, dividers |
| Slate 50 | `#F8FAFC` | Page backgrounds |
| White | `#FFFFFF` | Cards, surfaces |

### Icon Concept
An abstract "M" composed of two ascending lines that converge at a point, forming a peak/summit shape. The lines have slight neural-network-style curves. Can also be read as an open book viewed from above, or two paths merging toward excellence.

### Brand Symbol Meaning
The converging lines represent: student + tutor coming together, knowledge pathways connecting, the upward trajectory of learning growth.

---

## 3. UI Design System

### Website Color Scheme
- **Background:** Slate 50 (`#F8FAFC`) with White cards
- **Navigation:** Deep Indigo (`#1E1B4B`) or White with Indigo accents
- **CTAs:** Vivid Violet (`#7C3AED`) with white text
- **Hover states:** Violet darkened to `#6D28D9`
- **Active/Focus:** Violet ring with `#7C3AED` + 20% opacity glow

### Typography Hierarchy
| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 | Plus Jakarta Sans | 36px / 2.25rem | Bold (700) |
| H2 | Plus Jakarta Sans | 30px / 1.875rem | Semibold (600) |
| H3 | Plus Jakarta Sans | 24px / 1.5rem | Semibold (600) |
| H4 | Plus Jakarta Sans | 20px / 1.25rem | Medium (500) |
| Body | Inter | 16px / 1rem | Regular (400) |
| Body Small | Inter | 14px / 0.875rem | Regular (400) |
| Caption | Inter | 12px / 0.75rem | Medium (500) |
| Button | Inter | 14px / 0.875rem | Semibold (600) |

### Design Language
- **Border radius:** 8px for cards, 6px for inputs, 9999px for pills/badges
- **Shadows:** Subtle — `0 1px 3px rgba(0,0,0,0.1)` for cards, `0 4px 6px rgba(0,0,0,0.07)` for elevated
- **Spacing:** 4px base unit (4, 8, 12, 16, 24, 32, 48, 64)
- **Grid:** 12-column on desktop, 4-column on mobile
- **Animations:** Subtle ease-out transitions, 150–200ms duration
- **Icons:** Lucide React (consistent, clean line icons)
- **Illustrations:** Minimal, geometric, using brand violet + indigo

---

## 4. Product Architecture

### Frontend (Web) — React + Vite
```
React SPA → Laravel API
├── Zustand (state management)
├── React Router (routing)
├── TanStack Query (API data fetching + caching)
├── Tailwind CSS (styling)
├── Radix UI (accessible primitives)
└── Socket.io client (realtime)
```

### Frontend (Mobile) — React Native + Expo
```
React Native → Laravel API
├── React Navigation (routing)
├── TanStack Query (API data fetching)
├── NativeWind or RN StyleSheet (styling)
├── Expo AV (video/audio)
└── Socket.io client (realtime)
```

### Backend — Laravel 11 (API-only)
```
Laravel API
├── Sanctum (auth — SPA + mobile tokens)
├── Laravel Echo + Pusher/Soketi (WebSocket)
├── Laravel Queues + Redis (background jobs)
├── Laravel Media Library (file uploads)
├── Laravel Cashier (payments — Stripe)
├── FFmpeg (video processing)
└── Claude API (AI features)
```

### Database — MySQL 8+
Primary relational database for all structured data.

### Cache/Queue — Redis
Session cache, queue backend, realtime pub/sub.

### File Storage — S3 or DigitalOcean Spaces
Lesson recordings, tutor reels, profile photos, uploaded documents.

### Video Infrastructure
- **Live classroom:** WebRTC via LiveKit or Daily.co (self-hosted or SaaS)
- **Recordings:** Stored to S3, processed via FFmpeg
- **Reels:** Uploaded video, transcoded + thumbnailed via background jobs

### AI Services — Claude API
- Lesson summary generation
- Flashcard generation
- Practice question generation
- Doubt solving
- Study mission personalization
- Curriculum extraction from PDFs
- Study schedule optimization

### High-Level Architecture Diagram
```
┌─────────────┐  ┌─────────────┐
│  React Web  │  │React Native │
│   (Vite)    │  │   (Expo)    │
└──────┬──────┘  └──────┬──────┘
       │                │
       └───────┬────────┘
               │ HTTPS / WSS
       ┌───────▼────────┐
       │   Nginx/LB     │
       └───────┬────────┘
               │
       ┌───────▼────────┐
       │  Laravel API   │◄──── Redis (cache + queue)
       │  (Sanctum)     │
       └──┬───┬───┬─────┘
          │   │   │
    ┌─────▼┐ ┌▼───▼──┐  ┌──────────┐
    │MySQL │ │  S3   │  │Claude API│
    └──────┘ └───────┘  └──────────┘
                │
          ┌─────▼─────┐
          │  LiveKit   │ (WebRTC)
          └───────────┘
```

---

## 5. System Modules

### Module 1: Auth & Users
- Registration (student, parent, tutor application)
- Login (email/password, social OAuth)
- Role-based access (admin, tutor, student, parent)
- Tutor onboarding flow (guided setup + demo classroom)
- Parent-student account linking

### Module 2: Tutor Profiles
- Photo, bio, qualifications
- Subjects, exam boards, levels
- Intro video upload
- Review/rating system
- Verification badge (admin-approved)

### Module 3: Scheduling & Booking
- Tutor availability calendar (recurring + one-off slots)
- Student lesson booking
- Recurring lesson series
- Reminders (email + push notification)
- Attendance tracking
- Calendar sync (Google Calendar, iCal)

### Module 4: Live Classroom
- WebRTC video/audio (LiveKit)
- Real-time chat
- Collaborative whiteboard (tldraw or Excalidraw)
- Screen sharing
- File sharing during lesson
- Lesson recording (auto-saved to S3)
- AI Lesson Copilot sidebar (tutor-only)

### Module 5: Automatic Lesson Package
- Triggered post-lesson via queue job
- AI generates: summary, key notes, flashcards, practice questions, homework draft
- Stored linked to lesson record
- Visible to student, tutor, parent

### Module 6: Curriculum System
- Built-in curriculum library (GCSE, IGCSE, AS, A-Level for Maths, English, Bio, Chem, Physics)
- Curriculum browser for tutors
- Custom curriculum upload (PDF → topic extraction via AI)
- Topic → subtopic hierarchy
- Lesson-to-topic linking

### Module 7: Question Bank & Exam Simulator
- Question database (by subject, topic, difficulty, exam board)
- Timed mock exams
- Auto-marking (MCQ immediate, written via AI)
- Grade prediction model
- Weak topic analysis → feeds Knowledge Map

### Module 8: Student Knowledge Map
- Visual topic mastery grid/tree
- Percentage per topic based on quiz/exam/homework performance
- Color-coded (red/amber/green)
- Feeds into AI study mission generation

### Module 9: Daily AI Study Missions
- Personalized daily tasks based on Knowledge Map
- Mix of: flashcards, practice questions, mini quizzes, reel suggestions, focus exercises
- Streak tracking + XP system
- Push notifications for daily reminders

### Module 10: AI Doubt Solver
- Student asks question (text or image upload)
- AI generates explanation
- Option to escalate to tutor
- Tutor sees question + AI suggested answer
- Tutor edits/approves or sends voice/video explanation

### Module 11: Tutor Reels
- Short video upload (max 3 min)
- Auto-transcoding + thumbnail generation
- Student feed (algorithmic: by subject interest)
- Like, save, share
- Competition challenges embedded in reels

### Module 12: Competitions
- Tutor posts challenge (via reel or standalone)
- Students submit answers
- XP rewards
- Leaderboard per competition

### Module 13: Student Forum
- Category-based (by subject + level + special interest)
- Threaded discussions
- Upvotes, best answer marking
- Moderation queue (report + admin review)
- AI-assisted content moderation

### Module 14: Study Groups
- Student-created private groups
- Group chat
- Shared resources
- Group study sessions (optional video)

### Module 15: Messaging
- 1:1 messaging (tutor ↔ student)
- File/image sharing
- Read receipts
- Push notifications

### Module 16: Parent Dashboard
- Linked to student account(s)
- View: lesson history, summaries, homework completion, progress charts
- Notifications for upcoming/completed lessons
- Read-only (no direct platform interaction beyond messaging tutor)

### Module 17: Mental Dojo
- Structured course system (levels/modules)
- Content types: guided visualization, breathing exercises, focus exercises, reflection prompts
- Categories: exam calmness, confidence building, focus, resilience
- Progress tracking
- Unlockable content (XP-gated or sequential)

### Module 18: AI Study Coach
- Analyzes performance data holistically
- Weekly recommendations
- Identifies patterns (e.g., "you perform worse on Thursday sessions")
- Suggests focus areas, study strategies

### Module 19: AI Study Time Optimizer
- Student inputs available study hours
- AI generates optimal schedule based on: weak topics, upcoming exams, energy patterns
- Integrates with calendar
- Adjustable by student

---

## 6. Database Schema Proposal

### Core Tables
```
users (id, name, email, password, role, avatar, status, created_at)
tutor_profiles (id, user_id, bio, qualifications, intro_video_url, verified, onboarding_complete)
tutor_subjects (id, tutor_id, subject_id, level_id, exam_board_id)
students (id, user_id, year_group, target_grades)
parents (id, user_id)
parent_student (parent_id, student_id)

subjects (id, name, slug)
levels (id, name, slug)  -- GCSE, A-Level, etc.
exam_boards (id, name, slug)  -- AQA, Edexcel, OCR, etc.

curriculum_topics (id, subject_id, level_id, exam_board_id, parent_id, name, order)
custom_curricula (id, tutor_id, title, source_pdf_url, extracted_data)

availability_slots (id, tutor_id, day_of_week, start_time, end_time, is_recurring)
bookings (id, student_id, tutor_id, slot_id, lesson_id, status, booked_at)
lessons (id, tutor_id, student_id, subject_id, topic_id, scheduled_at, duration, status, recording_url)

lesson_packages (id, lesson_id, summary, key_notes, flashcards_json, practice_questions_json, homework_draft)

questions (id, subject_id, topic_id, level_id, exam_board_id, type, content, options_json, correct_answer, explanation, difficulty)
exam_sessions (id, student_id, title, time_limit, started_at, completed_at, score, grade_prediction)
exam_answers (id, exam_session_id, question_id, student_answer, is_correct, ai_feedback)

knowledge_map_entries (id, student_id, topic_id, mastery_pct, last_assessed_at)

study_missions (id, student_id, date, tasks_json, completed, xp_earned)
streaks (id, student_id, current_streak, longest_streak, last_active_date)
xp_log (id, student_id, amount, source_type, source_id, earned_at)

doubts (id, student_id, tutor_id, question_text, image_url, ai_answer, tutor_answer, tutor_media_url, status)

reels (id, tutor_id, title, video_url, thumbnail_url, subject_id, views, likes, created_at)
reel_likes (id, reel_id, user_id)
reel_saves (id, reel_id, user_id)

competitions (id, tutor_id, reel_id, title, description, deadline, xp_reward)
competition_entries (id, competition_id, student_id, answer, is_correct, submitted_at)

forum_categories (id, name, slug, description)
forum_threads (id, category_id, user_id, title, body, pinned, locked, created_at)
forum_replies (id, thread_id, user_id, body, is_best_answer, created_at)
forum_reports (id, reportable_type, reportable_id, user_id, reason, status)

study_groups (id, name, created_by, is_private)
study_group_members (id, group_id, user_id, role)
study_group_messages (id, group_id, user_id, body, media_url, created_at)

messages (id, sender_id, receiver_id, body, media_url, read_at, created_at)

mental_dojo_courses (id, title, category, description, order)
mental_dojo_modules (id, course_id, title, type, content_json, order)
mental_dojo_progress (id, student_id, module_id, completed_at)

notifications (id, user_id, type, data_json, read_at, created_at)

ai_coach_recommendations (id, student_id, content, type, generated_at)
study_schedules (id, student_id, schedule_json, generated_at)
```

---

## 7. Key User Flows

### Flow 1: Student Finds and Books a Tutor
1. Student browses tutor directory (filter by subject, level, exam board)
2. Views tutor profile (bio, qualifications, intro video, reviews)
3. Selects available time slot
4. Confirms booking → payment processed
5. Receives confirmation + calendar invite
6. Reminder notification before lesson

### Flow 2: Live Lesson
1. Both join classroom at scheduled time
2. Video/audio connects via WebRTC
3. Tutor teaches using whiteboard + screen share
4. Tutor uses AI Copilot to generate examples/questions in real-time
5. Chat available for links/notes during lesson
6. Lesson auto-recorded
7. Post-lesson: AI generates lesson package (summary, flashcards, etc.)
8. Student and parent can view lesson package

### Flow 3: Self-Study Loop
1. Student opens daily study missions
2. Completes flashcard review
3. Answers practice questions
4. Watches suggested tutor reel
5. Earns XP, streak continues
6. Knowledge Map updates based on performance
7. AI adjusts tomorrow's missions based on weak areas

### Flow 4: Doubt Resolution
1. Student encounters question while studying
2. Types question or uploads photo
3. AI generates explanation immediately
4. Student can accept or escalate to tutor
5. Tutor receives notification, sees question + AI suggestion
6. Tutor edits and sends final answer (text, voice, or video)

### Flow 5: Tutor Onboarding
1. Tutor applies via form (qualifications, subjects, experience)
2. Admin reviews and approves
3. Tutor completes guided onboarding tutorial
4. Tutor sets up profile (photo, bio, intro video)
5. Tutor configures subjects, levels, exam boards
6. Tutor completes demo classroom session
7. Profile goes live on platform

---

## 8. Development Roadmap

### Phase 1: MVP (Weeks 1–10)
**Goal:** Tutor profiles + scheduling + live classroom
- Auth system (register, login, roles)
- Tutor profile CRUD
- Tutor directory with search/filters
- Availability management
- Lesson booking system
- Live classroom (WebRTC video, chat, whiteboard, screen share)
- Basic lesson recording
- Admin panel (tutor approval, user management)
- Student dashboard (upcoming lessons, past lessons)
- Parent dashboard (view student progress)
- Payment integration (Stripe)
- Push notifications
- React web app + React Native mobile app (core screens)

### Phase 2: AI Learning Tools (Weeks 11–18)
**Goal:** AI-powered post-lesson tools + study features
- Automatic lesson package generation (AI summaries, flashcards, practice Q's)
- AI Lesson Copilot (tutor-side, during lessons)
- Question bank + exam simulator
- Student Knowledge Map
- AI Doubt Solver
- Curriculum library (GCSE/A-Level for 5 subjects)
- Custom curriculum upload + AI extraction

### Phase 3: Community Features (Weeks 19–24)
**Goal:** Engagement, social learning, and gamification
- Tutor Reels (upload, feed, likes)
- Competitions
- Student Forum
- Study Groups
- Messaging system
- Daily AI Study Missions + XP + streaks
- Leaderboards

### Phase 4: Mental Dojo & Advanced AI (Weeks 25–30)
**Goal:** Wellbeing + intelligent optimization
- Mental Dojo course system
- Visualization, breathing, focus exercises
- AI Study Coach (weekly recommendations)
- AI Study Time Optimizer
- Advanced analytics for tutors
- Grade prediction model refinement

---

## 9. MVP Feature List (Phase 1)

| # | Feature | Priority |
|---|---------|----------|
| 1 | User registration + login (email/password) | Must |
| 2 | Role system (admin, tutor, student, parent) | Must |
| 3 | Tutor application + admin approval | Must |
| 4 | Tutor profile (photo, bio, qualifications, subjects) | Must |
| 5 | Tutor directory with search + filters | Must |
| 6 | Tutor availability calendar | Must |
| 7 | Lesson booking + confirmation | Must |
| 8 | Stripe payment integration | Must |
| 9 | Live classroom (video, audio, chat) | Must |
| 10 | Whiteboard in classroom | Must |
| 11 | Screen sharing | Must |
| 12 | Lesson recording | Should |
| 13 | Student dashboard | Must |
| 14 | Parent dashboard (read-only progress view) | Should |
| 15 | Admin panel (user management, tutor approval) | Must |
| 16 | Email notifications (booking, reminders) | Must |
| 17 | Push notifications (mobile) | Should |
| 18 | React web app (responsive) | Must |
| 19 | React Native mobile app (iOS + Android) | Must |
| 20 | Tutor onboarding tutorial | Should |
