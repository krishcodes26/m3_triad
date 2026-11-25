# M3 Triad — Project Summary & Quick Navigation

**Last Updated:** November 23, 2026

---

## What is M3 Triad?

M3 Triad is a **personal operating system gamified as a LIFE RPG**. It converts real-world achievements across three life areas into measurable progress:

- **Mind** — Learning, focus, cognitive work (reading, deep work, study)
- **Muscle** — Physical training, nutrition, hydration, recovery
- **Money** — Business execution, revenue, client delivery, financial sovereignty

Each vector has independent XP, levels, telemetry, and progression. The system is **non-punitive** — progress is immutable and can never be deleted.

---

## Project Status

**Current State:**
- ✅ Design system complete (10 SVG screens)
- ✅ Logic specification finalized (`logic.md` — 2,087 lines)
- ✅ Project organized (`PROJECT_ORGANIZATION.md`)
- ✅ Implementation roadmap drafted (`IMPLEMENTATION_ROADMAP.md`)
- 🔄 Backend implementation — IN PROGRESS
- 🔄 Frontend implementation — PLANNED

**Next Steps:**
1. Confirm product decisions (see section below)
2. Implement Phase 1: Data Foundation
3. Build core progression system
4. Integrate domains
5. Validation and launch

---

## Key Documents

### For Quick Understanding
1. **This file** (`00_PROJECT_SUMMARY.md`) — Start here
2. **[LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md)** — Complete breakdown of the system (20,000 words)
3. **[logic.md](./logic.md)** — Original specification (source of truth)
4. **[README.md](./README.md)** — Project overview

### For Organization & Structure
5. **[PROJECT_ORGANIZATION.md](./PROJECT_ORGANIZATION.md)** — Folder structure and conventions
6. **docs/** — All detailed documentation (move existing docs here)

### For Implementation
7. **[IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)** — 6 phases, week-by-week
8. **config/** — Configurable reward tables and thresholds
9. **src/** — Next.js source code (organized by domain)
10. **supabase/** — Edge functions and RLS policies

---

## System Architecture at a Glance

### Three Pillars

```
        Mind (Intellect)
        /      |      \
    Reading Focus Study
       /        |        \
     Pages  Hours  Projects
       \        |        /
        +------XP------+
             |
      Character Level
      (Lifetime XP Sum)
             |
      Rank, Badges, Titles
             |
      Harmony & Balance

        Muscle (Vitality)              Money (Sovereignty)
       /      |      \               /      |      \
   Workout Nutrition Sleep       Revenue Business Clients
    /        |      \              /        |      \
  Sets Protein Target Sleep     Sales Invoices Goals
    \        |      /              \        |      /
     +------XP------+               +------XP------+
```

### Non-Negotiable Rules

**🔒 Immutability**
- Lifetime XP never deleted
- Badges never removed
- Levels never rolled back
- Streaks pause but don't reset progression
- Corrections create audit entries, don't overwrite

**⚡ Idempotency**
- Same event key → award only once
- Duplicate button tap → single reward
- Retried API request → original result

**🛡️ Anti-Farming**
- Caps and cooldowns per rule
- One protein-target per 24-hour cycle
- PR bonus only for verified improvement
- Server is authoritative for XP (never client)

**⚖️ Balance**
- Harmony score prevents one vector dominating
- Rank promotions require vector stability, not just big numbers
- Balance gates progression without deleting achievement

---

## Core Concepts

### XP System
```
lifetime_xp = mind_xp + muscle_xp + money_xp

Each vector has:
  - Independent XP balance
  - Independent level progression
  - Independent telemetry

Character has:
  - Lifetime XP total (sum of vectors)
  - Overall level (separate from vector levels)
  - Rank (requires level + XP + vector balance)
  - Harmony score (measure of balance)
```

### Vector Level Example
Mind Level 26 means: 26,000+ total Mind XP earned
(Assuming 1,000 XP per level — NEEDS PRODUCT CONFIRMATION)

### Character Level Example
Character Level 24 means: 24,000+ total lifetime XP earned
(Same assumption — NEEDS CONFIRMATION of curve)

### Harmony Score (0–100%)
```
Formula: (min_score × 0.4) + (avg_score × 0.6)

Where:
  min_score = lowest of normalized Mind, Muscle, Money
  avg_score = average of three normalized scores

Purpose:
  - Encourage balanced growth
  - Gate rank promotions
  - Throttle progression if one vector lags
  - Never delete XP (only progression gate)

NOTE: Normalization function NEEDS PRODUCT CONFIRMATION
```

### Rank Ladder (8 Tiers)
```
E: Novice          (Starting tier)
D: Apprentice      (Progression tier)
C: Warrior         (Level 20–29)
B: Elite           (Level 30–44, requires Lvl 25+ all vectors)
A: Master          (Level 45–59)
S: Grandmaster     (Level 60–74)
SS: Legend         (Level 75–89)
SSS: Mythic        (Level 90+)

Rank requires:
  - Character level threshold
  - Lifetime XP threshold
  - Minimum level in EACH vector (stability requirement)
  - Minimum harmony score
  - Any required badges/milestones
```

---

## Critical Product Decisions PENDING

**These MUST be confirmed before hard-coding:**

| Decision | Current Assumption | Need From Product |
|----------|-------------------|-------------------|
| Vector level curve | 1,000 XP per level | Confirm or provide scaling table |
| Character level curve | Scaling starting 1,000 XP | Provide cumulative thresholds for each level |
| Harmony normalization | Unknown | Define formula to convert levels to 0–100 |
| Harmony gating | Variable by rank | Specify min harmony for each rank promotion |
| Rank requirements | Only C & B visible | Complete spec for D, A, S, SS, SSS |
| Reward values | Examples from designs | Finalize all action reward amounts |
| Workout XP | Session + PR bonuses | Define how bonuses stack |
| Nutrition cycle | 24-hour window | Confirm local midnight vs rolling 24h |
| Streak behavior | Undefined | Confirm pause/break/grace on missed day |
| Boss HP formula | Undefined | Define damage calculation & missed-day handling |
| Mission verification | Partial | Specify which tasks need manual vs auto verification |
| Cross-vector badge | Day definition needs detail | Define minimum daily activity per vector |
| Perk effects | Names only | Define actual gameplay effects (not guess) |
| Guild/Social | Unclear if v1 | Confirm leaderboard visibility for v1 |

**ACTION:** Schedule product sync to confirm all 14 items before implementation.

---

## Domain Ownership Map

```
Domain          | Owns                  | Emits XP Events
----------------|----------------------|-------------------
Habits          | Protocols, streaks    | Protocol completed, milestone
Nutrition       | Food logs, macros     | Protein target reached, hydration
Workouts        | Sessions, sets, PRs   | Session completed, PR, volume milestone
Focus/Reading   | Sessions, logs        | Focus block, reading target
Money           | Actions, revenue      | Verified action, milestone, delivery
Quests          | Daily challenges      | Quest completed, boss defeated
Missions        | Long-term goals       | Task completed, milestone verified
Character       | Aggregate progress    | Level-up, rank-up, balance milestone
Calendar        | Activity timeline     | (Read-only view)
Analytics       | Trends & aggregates   | (Read-only view)
Notifications   | Delivery & read state | (Read-only view)
```

**Key Rule:** Each domain owns its source records. Analytics, Calendar, and Notifications are read-only views. XP ledger is centralized and immutable.

---

## Folder Structure Overview

```
D:\Projects\M3 Triad\
├── docs/                          # All documentation
│   ├── LOGIC.md                   # Main spec (copy of logic.md)
│   ├── ARCHITECTURE.md            # System design
│   ├── DATABASE_SCHEMA.md         # Supabase schema
│   ├── API_SPECIFICATION.md       # API endpoints
│   └── [other docs]               # Design, guides, setup, etc.
│
├── designs/                       # SVG screens (dashboard, profile, etc.)
│
├── src/                           # Next.js source code
│   ├── app/api/                   # API routes by domain
│   ├── components/screens/        # Full-page components
│   ├── lib/services/              # Business logic per domain
│   ├── lib/utils/                 # XP calculators, validators
│   ├── lib/constants/             # XP curves, rank definitions
│   └── types/                     # TypeScript interfaces
│
├── supabase/                      # Supabase-specific
│   ├── functions/                 # Edge functions
│   └── rls-policies/              # Row-level security SQL
│
├── config/                        # Configurable data (JSON)
│   ├── xp-reward-rules.json       # All action rewards
│   ├── level-thresholds.json      # XP curves
│   ├── rank-requirements.json     # Rank ladder
│   └── badge-definitions.json     # Badge catalog
│
├── migrations/                    # Database migrations
├── scripts/                       # Setup, seed, maintenance scripts
├── tests/                         # Unit, integration, e2e tests
│
├── package.json, tsconfig.json    # Config files (at root)
├── .env.local                     # Secrets (at root)
├── README.md                      # Main entry point
└── PROJECT_ORGANIZATION.md        # This structure explained
```

---

## Implementation Timeline

### Phase 1: Data Foundation (Weeks 1-2)
Build immutable XP ledger, progression tracking, event idempotency.
- ✅ Progression events table
- ✅ XP ledger table
- ✅ Vector & character progress cache
- ✅ Configuration tables
- ✅ RLS policies

### Phase 2: Core Progression (Weeks 3-4)
XP calculation, levels, ranks, harmony.
- ✅ XP calculator service
- ✅ Level calculator (vector + character)
- ✅ Harmony calculator (pending product decision)
- ✅ Rank eligibility engine
- ✅ Configuration files

### Phase 3: Achievements (Weeks 5-6)
Badges, titles, perks.
- ✅ Badge evaluator
- ✅ Title vault
- ✅ Perk system
- ✅ Badge catalog

### Phase 4: Domain Integrations (Weeks 7-10)
Connect all major domains.
- ✅ Habits & streaks
- ✅ Nutrition & protein reward
- ✅ Workouts & PRs
- ✅ Focus & reading
- ✅ Money actions
- ✅ Quests
- ✅ Missions

### Phase 5: Read Models & Polish (Weeks 11-13)
User-facing screens and dashboards.
- ✅ Dashboard
- ✅ Character/Profile
- ✅ Calendar
- ✅ Analytics
- ✅ Notifications (full)

### Phase 6: Validation & Launch (Weeks 14-15)
54 acceptance tests, simulations, security validation.
- ✅ Acceptance tests
- ✅ Progression simulations
- ✅ Anti-farming validation
- ✅ Performance optimization
- ✅ Launch readiness

**Estimated Duration:** 15 weeks solo developer, 8 weeks with 2 developers

---

## Reading Guide for Different Roles

### Product Manager
1. Start: `README.md`
2. Read: `LOGIC_ANALYSIS.md` (Executive Summary + Product Decisions sections)
3. Review: `docs/DESIGN_SYSTEM.md`
4. Confirm: All 14 items in "Critical Product Decisions PENDING"

### Engineer (Full-Stack)
1. Start: `README.md`
2. Read: `LOGIC_ANALYSIS.md` (all sections)
3. Study: `logic.md` (original spec)
4. Understand: `PROJECT_ORGANIZATION.md`
5. Plan: `IMPLEMENTATION_ROADMAP.md`
6. Build: Phases 1–6 in sequence

### Engineer (Backend Only)
1. Start: `IMPLEMENTATION_ROADMAP.md` (Phase 1–4)
2. Focus: Section 22 (Data Model) + Section 23 (Backend Architecture)
3. Build: Supabase schema, API routes, services
4. Test: Phases 1–4 test suite

### Engineer (Frontend Only)
1. Start: `IMPLEMENTATION_ROADMAP.md` (Phase 5)
2. Focus: Section 2 (Navigation), 20 (Notifications), 21 (Profile)
3. Study: Design screens in `/designs`
4. Build: React components and UI
5. Connect: To backend APIs from Phase 4

### QA/Tester
1. Start: `IMPLEMENTATION_ROADMAP.md` (Phase 6)
2. Review: All 54 acceptance tests (Section 28 of logic.md)
3. Build: Test plans for each phase
4. Run: Progression simulations, anti-farming tests, security validation

### Designer
1. Review: Existing designs (`source_designs/` or `designs/`)
2. Reference: `DESIGN_SYSTEM.md`
3. Collaborate: With product and engineering on screens

---

## Common Questions & Answers

### Q: What happens if I miss a day?
**A:** Current streak pauses or resets (TBD by product), but lifetime XP is NOT deleted. Best streak is permanent. Missed day = 0 XP, never negative.

### Q: Can I farm XP by logging 100 tiny workouts?
**A:** No. Caps and cooldowns prevent this. Example: One workout completion reward per session, one PR bonus per verified improvement. Backend validates all XP awards.

### Q: If I quit a habit, do I lose my level?
**A:** No. Levels are permanent. Quitting a habit pauses your current streak for that habit, but you keep all earned XP and badges.

### Q: How is Harmony calculated?
**A:** Formula is `(min_score × 0.4) + (avg_score × 0.6)`, but how to convert levels to 0–100 score needs product approval. This is pending.

### Q: Can the client award itself XP?
**A:** No. Server validates all XP claims. Client can only request; backend decides if XP is earned.

### Q: If a rule changes, do old rewards get adjusted?
**A:** No. Historical rewards are immutable. New rules apply only to future events. Each ledger entry records the rule version used.

### Q: Can I see other users' progress?
**A:** Only public/guild-approved fields (title, rank, some badges). Private data (nutrition, workouts, habits, money) stays private by default.

---

## Success Metrics

### System Stability
- ✅ Zero data integrity issues in 1 month
- ✅ No duplicate XP awards despite retry storms
- ✅ <100ms XP award latency at p99
- ✅ 99.9% uptime

### User Engagement
- ✅ 70%+ daily active users
- ✅ 50%+ habit completion rate
- ✅ 3+ vector progression per user
- ✅ Rank promotion every 4–6 weeks (average)

### Fairness & Balance
- ✅ No exploitable farming routes
- ✅ Vectors balanced within 15% of each other
- ✅ Harmony score > 60 for 80%+ of users
- ✅ Rank ladder achievable within 1 year

---

## Support & Resources

### Where to Find Things
- **System Logic:** `LOGIC_ANALYSIS.md` or `logic.md`
- **Project Structure:** `PROJECT_ORGANIZATION.md`
- **Implementation Plan:** `IMPLEMENTATION_ROADMAP.md`
- **Design Specs:** `docs/DESIGN_SYSTEM.md` or `source_designs/`
- **Database Schema:** `docs/DATABASE_SCHEMA.md` (create during Phase 1)
- **API Endpoints:** `docs/API_SPECIFICATION.md` (create during Phase 4)

### Need to File an Issue?
1. Check `OPEN_QUESTIONS.md` for existing decisions
2. Reference specific section in `logic.md`
3. Include: Problem, current behavior, expected behavior
4. Tag with domain (habits, workouts, progression, etc.)

### How to Add a New Feature
1. Document in `docs/`
2. Add spec to `logic.md` section
3. Create config in `config/`
4. Implement in relevant `src/lib/services/[domain].ts`
5. Add API route in `src/app/api/[domain]/`
6. Write tests in `tests/`
7. Update this summary

---

## Technical Stack

- **Framework:** Next.js 14+ (React)
- **Language:** TypeScript
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Authentication:** Supabase Auth
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Supabase)
- **Testing:** Jest + React Testing Library
- **Deployment:** Vercel (frontend) + Supabase (backend)

---

## Key Principles

1. **Server is Authoritative** — Never trust client for XP, levels, rank, harmony
2. **Ledger is Immutable** — Never delete or edit historical entries; corrections create new rows
3. **Events are Idempotent** — Same event key → same result, always
4. **Non-Punitive** — Missed days don't subtract XP; broken streaks don't erase progress
5. **Configurable** — Reward amounts, thresholds, formulas are in JSON, not code
6. **Domain-Owned** — Each domain manages its source records; XP ledger is shared
7. **Auditable** — Every decision is logged with rule version and timestamp
8. **Privacy-First** — Private data hidden by default; guild/public requires explicit opt-in

---

## Next Actions

**Immediate (This Week)**
1. ✅ Review this summary
2. ✅ Read `LOGIC_ANALYSIS.md`
3. ✅ Confirm all 14 product decisions
4. ✅ Schedule Phase 1 kickoff

**Phase 1 Kickoff (Weeks 1-2)**
1. Create data foundation
2. Build XP ledger and progression tracking
3. Set up RLS policies
4. Write database tests

**Weekly Sync**
- 15-min standup on progress
- Blockers and decisions needed
- Product feedback on balance/fairness

---

## Contact & Questions

For clarification on:
- **Logic/Rules:** Reference `logic.md` section or `LOGIC_ANALYSIS.md`
- **Implementation:** See `IMPLEMENTATION_ROADMAP.md` phase
- **Organization:** See `PROJECT_ORGANIZATION.md`
- **Specific Domain:** Search by domain name (e.g., "Habits" in `LOGIC_ANALYSIS.md`)

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| Nov 23, 2026 | 1.0 | Initial analysis, organization, and roadmap |

---

**Last Updated: November 23, 2026**

**Status: Ready for Phase 1 implementation**

---

## Appendix: File Reference

### Documentation Files Created
- `LOGIC_ANALYSIS.md` — 20,000-word complete breakdown
- `PROJECT_ORGANIZATION.md` — Folder structure and conventions
- `IMPLEMENTATION_ROADMAP.md` — 6 phases with weekly tasks
- `00_PROJECT_SUMMARY.md` — This file

### Original Files
- `logic.md` — Source of truth (2,087 lines)
- `source_designs/` — 10 SVG design screens

### To Be Created (Phase 1+)
- `docs/DATABASE_SCHEMA.md`
- `docs/API_SPECIFICATION.md`
- `config/xp-reward-rules.json`
- `config/level-thresholds.json`
- `config/rank-requirements.json`
- `config/badge-definitions.json`
- `src/lib/services/progression.ts` and others
- `supabase/functions/` and `supabase/rls-policies/`
- Comprehensive test suite

---

**You're ready. Let's build a system that rewards real-world progress. 🚀**
