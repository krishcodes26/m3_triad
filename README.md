# M3 Triad — LIFE RPG Personal Operating System

![Status](https://img.shields.io/badge/Status-Ready%20for%20Implementation-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0-blue)
![Last Updated](https://img.shields.io/badge/Updated-Nov%2025%2C%202026-orange)

## 🎮 What is M3 Triad?

M3 Triad is a **personal operating system gamified as a LIFE RPG** that transforms real-world achievements into measurable progress across **three attribute vectors:**

- 🧠 **Mind** — Learning, focus, cognitive work
- 💪 **Muscle** — Physical training, nutrition, recovery
- 💰 **Money** — Business, revenue, sovereignty

The system is fundamentally **non-punitive** and **immutable**:
- Lifetime progress is **never deleted**
- Missed days **never subtract XP**
- Broken streaks **never erase achievements**
- Balance (harmony) **gates progression** but never erases value

---

## 📁 Project Structure

```
M3 Triad/
├── 📚 docs/                          # Complete documentation
│   ├── START_HERE.md                 # 👈 READ THIS FIRST
│   ├── LOGIC_ANALYSIS.md             # Complete system breakdown (20,000 words)
│   ├── IMPLEMENTATION_ROADMAP.md     # 6-phase implementation plan
│   ├── PROJECT_ORGANIZATION.md       # Folder structure & conventions
│   ├── QUICK_REFERENCE.md            # Developer cheat sheet
│   ├── ARCHITECTURE_DIAGRAM.txt      # System flows & diagrams
│   ├── INDEX.md                      # Complete documentation index
│   └── [other documentation]         # Design, setup, guides
│
├── 🎨 designs/                       # Design assets & SVG screens
│   ├── dashboard.svg
│   ├── profile.svg
│   └── [10 total design screens]
│
├── ⚙️ config/                        # Configuration (JSON, not hardcoded)
│   ├── xp-reward-rules.json          # XP award configurations
│   ├── level-thresholds.json         # XP curves (character + vectors)
│   ├── rank-requirements.json        # Rank ladder requirements
│   └── badge-definitions.json        # Badge catalog
│
├── 📝 src/                           # Next.js source code
│   ├── app/
│   │   ├── (auth)/                   # Auth routes & pages
│   │   ├── (dashboard)/              # Main app routes
│   │   └── api/                      # API routes
│   ├── components/
│   │   ├── ui/                       # Reusable UI components
│   │   ├── layouts/                  # Page layouts
│   │   └── screens/                  # Full-page components
│   ├── lib/
│   │   ├── services/                 # Business logic (domains)
│   │   ├── utils/                    # Utilities & calculators
│   │   ├── constants/                # Constants & configurations
│   │   └── hooks/                    # React hooks
│   └── types/                        # TypeScript definitions
│
├── 🗄️ supabase/                      # Supabase-specific files
│   ├── functions/                    # Edge functions
│   └── rls-policies/                 # Row-level security
│
├── 📋 scripts/                       # Setup & utility scripts
│   ├── setup-database.js
│   ├── create-demo-account.js
│   └── [other scripts]
│
├── 🧪 tests/                         # Test files
│   ├── unit/                         # Unit tests
│   ├── integration/                  # Integration tests
│   └── e2e/                          # End-to-end tests
│
├── 🔄 migrations/                    # Database migrations
├── .env.local                        # Environment variables (local)
├── .gitignore                        # Git ignore rules
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
└── README.md                         # This file
```

---

## 🚀 Quick Start

### For Everyone (5 min)
1. **[Start here: docs/START_HERE.md](./docs/START_HERE.md)** — Quick orientation
2. **Choose your role below** ↓

### For Engineers
```bash
# Read these in order:
1. docs/QUICK_REFERENCE.md              # Code patterns & formulas
2. docs/IMPLEMENTATION_ROADMAP.md       # Phases 1-6
3. docs/PROJECT_ORGANIZATION.md         # Code structure

# Then start Phase 1:
# See docs/IMPLEMENTATION_ROADMAP.md → Phase 1
```

### For Product Managers
```bash
# Read these:
1. docs/START_HERE.md                   # Overview
2. docs/00_PROJECT_SUMMARY.md           # Decisions needed
3. Confirm 14 product decisions before code starts
```

### For Tech Leads
```bash
# Read these in order:
1. docs/00_PROJECT_SUMMARY.md           # Overview
2. docs/PROJECT_ORGANIZATION.md         # Setup structure
3. docs/IMPLEMENTATION_ROADMAP.md       # Planning
4. Create folder structure per plan
5. Assign phases to team
```

### For QA/Testers
```bash
# Read these:
1. docs/QUICK_REFERENCE.md              # Testing checklist
2. docs/IMPLEMENTATION_ROADMAP.md       # Phase 6 (validation)
3. Plan 54 acceptance tests
```

---

## 📚 Documentation Guide

| Document | Purpose | Audience | Time |
|----------|---------|----------|------|
| [START_HERE.md](./docs/START_HERE.md) | Quick orientation | Everyone | 10 min |
| [00_PROJECT_SUMMARY.md](./docs/00_PROJECT_SUMMARY.md) | Executive overview & navigation | Everyone | 20 min |
| [QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md) | Code cheat sheet & patterns | Engineers | 30 min |
| [LOGIC_ANALYSIS.md](./docs/LOGIC_ANALYSIS.md) | Complete system spec | Technical | 2 hours |
| [IMPLEMENTATION_ROADMAP.md](./docs/IMPLEMENTATION_ROADMAP.md) | 6-phase plan (15 weeks) | Tech Lead | 1 hour |
| [PROJECT_ORGANIZATION.md](./docs/PROJECT_ORGANIZATION.md) | Folder structure | Tech Lead | 30 min |
| [ARCHITECTURE_DIAGRAM.txt](./docs/ARCHITECTURE_DIAGRAM.txt) | System flows | Technical | 20 min |
| [INDEX.md](./docs/INDEX.md) | Documentation index | Navigation | 10 min |

---

## 🎯 System Overview

### Three Independent Vectors

```
┌─────────────────────────────────────────────────────────────┐
│                   LIFETIME XP (sum of all)                  │
│                   CHARACTER LEVEL & RANK                    │
├──────────────────┬──────────────────┬──────────────────────┤
│   MIND (26)      │  MUSCLE (23)     │   MONEY (21)         │
│   26,000 XP      │  23,000 XP       │   21,000 XP          │
│   Level 26       │  Level 23        │   Level 21           │
│   Tier: 840/1000 │  Tier: 620/1000  │   Tier: 490/1000     │
└──────────────────┴──────────────────┴──────────────────────┘
         ▲                    ▲                    ▲
         │                    │                    │
      Habits              Workouts              Money
      Reading             Nutrition              Business
      Focus               Sleep                  Revenue
      Study               Hydration              Clients
```

### Rank Ladder

```
E: Novice (Starting)
  ↓
D: Apprentice
  ↓
C: Warrior (Lvl 20–29)
  ↓
B: Elite (Lvl 30–44, requires all vectors Level 25+)
  ↓
A: Master (Lvl 45–59)
  ↓
S: Grandmaster (Lvl 60–74)
  ↓
SS: Legend (Lvl 75–89)
  ↓
SSS: Mythic (Lvl 90+)
```

### Key Rules (Non-Negotiable)

✅ **Immutable Progression** — Lifetime XP never deleted  
✅ **Non-Punitive** — Missed days never subtract XP  
✅ **Balanced Growth** — All three vectors required for advancement  
✅ **Server Authoritative** — Backend calculates all XP (never client)  
✅ **Idempotent** — Duplicate requests return same result  
✅ **Auditable** — Full history preserved forever  

---

## ⚙️ Configuration

All **reward amounts, thresholds, and formulas are configurable** in JSON files:

```json
// config/xp-reward-rules.json
{
  "rule_key": "habit_completion",
  "base_xp": 20,
  "cap_scope": "per_occurrence",
  "cap_count": 1
}

// config/level-thresholds.json
{
  "scope": "character",
  "level": 24,
  "total_xp_required": 165000
}

// config/rank-requirements.json
{
  "rank_code": "B",
  "min_character_level": 30,
  "min_vector_levels": {
    "mind": 25,
    "muscle": 25,
    "money": 25
  }
}
```

**No hardcoding.** Easy to adjust post-launch.

---

## 🚨 Critical Product Decisions PENDING

**Before implementation, product must confirm:**

1. Vector level curve (1,000 XP per level or scaling?)
2. Character level thresholds (exact cumulative XP?)
3. Harmony normalization (conversion to 0–100 scale?)
4. Harmony gating (minimum per rank?)
5. Rank requirements (complete specs for ranks A–SSS?)
6. Reward values (final XP amounts?)
7. Workout XP formula (how session + PR + volume combine?)
8. Nutrition cycle (local midnight or rolling 24h?)
9. Streak behavior (pause, break, or grace on miss?)
10. Boss HP formula (damage calculation?)
11. Mission verification (manual vs auto?)
12. Cross-vector badge (daily activity minimums?)
13. Perk effects (actual gameplay benefits?)
14. Guild/Social (leaderboard visibility in v1?)

**→ See [docs/00_PROJECT_SUMMARY.md](./docs/00_PROJECT_SUMMARY.md) for details**

---

## 📅 Implementation Timeline

| Phase | Focus | Duration | Status |
|-------|-------|----------|--------|
| **1** | Data Foundation | Weeks 1-2 | 📋 Planned |
| **2** | Core Progression | Weeks 3-4 | 📋 Planned |
| **3** | Achievements | Weeks 5-6 | 📋 Planned |
| **4** | Domain Integrations | Weeks 7-10 | 📋 Planned |
| **5** | Read Models | Weeks 11-13 | 📋 Planned |
| **6** | Validation | Weeks 14-15 | 📋 Planned |

**Total: 15 weeks (1 dev) or 8 weeks (2 devs)**

---

## 🔧 Getting Started

### 1. Read Documentation
```bash
# Start with quick overview
cat docs/START_HERE.md

# Then dive by role
cat docs/QUICK_REFERENCE.md              # Engineers
cat docs/IMPLEMENTATION_ROADMAP.md       # Tech leads
cat docs/LOGIC_ANALYSIS.md               # Complete specs
```

### 2. Set Up Folder Structure
```bash
# Already done in this repo! Structure is ready.
# See docs/PROJECT_ORGANIZATION.md for details
```

### 3. Create Configuration
```bash
# Edit these JSON files per product decisions:
config/xp-reward-rules.json        # Update XP amounts
config/level-thresholds.json       # Update level curves
config/rank-requirements.json      # Update rank gates
config/badge-definitions.json      # Expand badge catalog
```

### 4. Start Phase 1
```bash
# See docs/IMPLEMENTATION_ROADMAP.md Phase 1
# Task 1.1: Inspect existing schema
# Task 1.2: Create progression_events table
# ... etc
```

---

## 📂 Key Folders Explained

### `/docs`
All documentation — specifications, guides, and references. **Start with [docs/START_HERE.md](./docs/START_HERE.md)**

### `/config`
Configuration files (JSON only). No hardcoded values. Easy to adjust rewards, levels, and requirements without redeploying.

### `/src`
Next.js application source code, organized by feature/domain.

### `/designs`
Design assets (SVG screens). Reference for UI implementation.

### `/scripts`
Setup, database, and utility scripts.

### `/supabase`
Supabase Edge Functions and RLS policies.

### `/tests`
Unit, integration, and E2E tests.

### `/migrations`
Database migrations (auto-generated from Supabase).

---

## 🔗 Important Links

| Resource | Location |
|----------|----------|
| **Quick Start** | [docs/START_HERE.md](./docs/START_HERE.md) |
| **System Overview** | [docs/00_PROJECT_SUMMARY.md](./docs/00_PROJECT_SUMMARY.md) |
| **Code Patterns** | [docs/QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md) |
| **Full Specification** | [docs/LOGIC_ANALYSIS.md](./docs/LOGIC_ANALYSIS.md) |
| **Implementation Plan** | [docs/IMPLEMENTATION_ROADMAP.md](./docs/IMPLEMENTATION_ROADMAP.md) |
| **Code Organization** | [docs/PROJECT_ORGANIZATION.md](./docs/PROJECT_ORGANIZATION.md) |
| **System Diagrams** | [docs/ARCHITECTURE_DIAGRAM.txt](./docs/ARCHITECTURE_DIAGRAM.txt) |
| **Documentation Index** | [docs/INDEX.md](./docs/INDEX.md) |

---

## ✅ Project Status

**Documentation:** ✅ Complete  
**Organization:** ✅ Ready  
**Configuration:** ✅ Created (pending product confirmation)  
**Implementation:** 🔄 Ready to start Phase 1  

---

## 🎯 Next Steps

1. **Read [docs/START_HERE.md](./docs/START_HERE.md)** (10 min)
2. **Pick your role** and follow guidance
3. **Confirm 14 product decisions** with Product Manager
4. **Begin Phase 1** per roadmap

---

## 📞 Questions?

- **System Logic?** → [docs/LOGIC_ANALYSIS.md](./docs/LOGIC_ANALYSIS.md)
- **Implementation?** → [docs/IMPLEMENTATION_ROADMAP.md](./docs/IMPLEMENTATION_ROADMAP.md)
- **Code Patterns?** → [docs/QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md)
- **Organization?** → [docs/PROJECT_ORGANIZATION.md](./docs/PROJECT_ORGANIZATION.md)
- **Find Anything?** → [docs/INDEX.md](./docs/INDEX.md)

---

## 📊 Quick Stats

- **Documentation:** ~20,000 words across 8 guides
- **Implementation phases:** 6 phases, 50+ weekly tasks
- **Code examples:** 20+ snippets provided
- **Acceptance tests:** 54 tests defined
- **Configuration types:** 4 JSON files
- **Database tables:** 22+ tables designed
- **Non-destructive rules:** 25 edge cases documented

---

## 🚀 Built With

- **Framework:** Next.js 14+
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **Auth:** Supabase Auth
- **Deployment:** Vercel + Supabase

---

## 📄 License

[Add appropriate license]

---

## 👥 Team

| Role | Focus |
|------|-------|
| Product Manager | Decisions & requirements |
| Tech Lead | Architecture & planning |
| Backend Engineer | Supabase & APIs |
| Frontend Engineer | React & UI |
| QA Engineer | Testing & validation |

---

**Last Updated:** November 25, 2026  
**Status:** ✅ Ready for Implementation  
**Next Step:** Start with [docs/START_HERE.md](./docs/START_HERE.md)

---

**Let's build a system that rewards real-world progress. 🚀**
