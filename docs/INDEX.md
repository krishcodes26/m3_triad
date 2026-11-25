# M3 Triad — Complete Documentation Index

**Purpose:** One-stop navigation for all project documentation.

**Last Updated:** November 23, 2026

---

## 📋 Start Here

| Document | Purpose | Audience | Read Time |
|----------|---------|----------|-----------|
| **[00_PROJECT_SUMMARY.md](./00_PROJECT_SUMMARY.md)** | Executive overview, decisions, timeline | Everyone | 10 min |
| **[README.md](./README.md)** | Main project entry point | Everyone | 5 min |
| **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** | Developer cheat sheet | Engineers | 5 min |

---

## 📚 Documentation Structure

### Core Specification
| Document | Coverage | Level | Pages |
|----------|----------|-------|-------|
| **[logic.md](./logic.md)** | Complete system spec | Authoritative | 90 |
| **[LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md)** | Detailed breakdown | Comprehensive | 100 |
| **[SYSTEM_ARCHITECTURE_DIAGRAM.png](./SYSTEM_ARCHITECTURE_DIAGRAM.png)** | Visual overview | High-level | 1 |

### Planning & Organization
| Document | Purpose | Audience |
|----------|---------|----------|
| **[PROJECT_ORGANIZATION.md](./PROJECT_ORGANIZATION.md)** | Folder structure, naming conventions | Engineers |
| **[IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)** | 6 phases, week-by-week tasks | Project Manager, Tech Lead |
| **[00_PROJECT_SUMMARY.md](./00_PROJECT_SUMMARY.md)** | Status, decisions, timeline | Leadership |

### In `/docs/` Folder
| Document | Purpose | Status |
|----------|---------|--------|
| DESIGN_SYSTEM.md | Visual design guidelines | To be moved |
| FUNCTIONAL_SPEC.md | Feature specifications | To be moved |
| IMPLEMENTATION_GUIDE.md | Implementation steps | To be moved |
| DATABASE_SCHEMA.md | To be created (Phase 1) | Pending |
| API_SPECIFICATION.md | To be created (Phase 4) | Pending |
| SETUP.md | Installation and setup | To be moved |

---

## 🎯 Find What You Need

### I need to understand...

#### The System Model
1. Start: [00_PROJECT_SUMMARY.md](./00_PROJECT_SUMMARY.md) (Section: "System Architecture at a Glance")
2. Deep dive: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Sections 1-3)
3. Visual: [SYSTEM_ARCHITECTURE_DIAGRAM.png](./SYSTEM_ARCHITECTURE_DIAGRAM.png)

#### XP & Progression Mechanics
1. Quick ref: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "Core Formulas")
2. Complete spec: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Sections 4-6)
3. Code examples: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "Common Code Snippets")

#### Ranks, Badges, Titles
1. Overview: [00_PROJECT_SUMMARY.md](./00_PROJECT_SUMMARY.md) (Section: "Rank Ladder")
2. Full spec: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Sections 8-9)
3. Code: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "Rank Promotion")

#### Harmony & Balance
1. Quick: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "Core Formulas" → Harmony)
2. Full: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 7)
3. ⚠️ **Needs confirmation** — See [00_PROJECT_SUMMARY.md](./00_PROJECT_SUMMARY.md) (Section: "Critical Product Decisions")

#### Habit/Workout/Nutrition/Missions
1. Summary: [00_PROJECT_SUMMARY.md](./00_PROJECT_SUMMARY.md) (Section: "Domain Ownership Map")
2. Full spec: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Sections 10-17)
3. Code patterns: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Sections: "Habit Logic", "Workout Logic", etc.)

#### Anti-Farming & Security
1. Rules: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 27)
2. Patterns: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "Anti-Farming Checks")
3. Database: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 24)

#### Folder Structure & Code Organization
1. Overview: [PROJECT_ORGANIZATION.md](./PROJECT_ORGANIZATION.md)
2. By domain: [PROJECT_ORGANIZATION.md](./PROJECT_ORGANIZATION.md) (Section: "Source Code Organization Strategy")
3. Naming: [PROJECT_ORGANIZATION.md](./PROJECT_ORGANIZATION.md) (Section: "File Naming Conventions")

#### Implementation Timeline & Tasks
1. High-level: [00_PROJECT_SUMMARY.md](./00_PROJECT_SUMMARY.md) (Section: "Implementation Timeline")
2. Detailed: [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) (All 6 phases)
3. Week-by-week: [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) (Section: "Phase 1-6")

#### Database Schema
1. Tables (Phase 1): [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "Database Tables")
2. Full design: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 22)
3. Queries: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "SQL Queries")

---

## 👥 By Role

### Product Manager
**Goal:** Understand the system and make product decisions.

1. ✅ Read: [00_PROJECT_SUMMARY.md](./00_PROJECT_SUMMARY.md)
2. ✅ Confirm: 14 items in "Critical Product Decisions PENDING"
3. ✅ Review: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) sections on key features (Ranks, Harmony, Anti-Farming)
4. ✅ Share feedback with team

**Priority decisions:** XP curves, Harmony formula, Rank requirements, Reward values

### Tech Lead / Architect
**Goal:** Plan implementation and lead engineering.

1. ✅ Read: [00_PROJECT_SUMMARY.md](./00_PROJECT_SUMMARY.md)
2. ✅ Study: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (all sections)
3. ✅ Plan: Use [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)
4. ✅ Organize: Set up folder structure per [PROJECT_ORGANIZATION.md](./PROJECT_ORGANIZATION.md)
5. ✅ Assign: Phase 1 tasks to team

**Key focus:** Architecture, database design, API contracts, security

### Backend Engineer
**Goal:** Implement server-side logic and database.

1. ✅ Read: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
2. ✅ Study: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) sections 4, 22, 23, 24
3. ✅ Implement: Phases 1-4 per [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)
4. ✅ Code patterns: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) all sections

**Key files to create:**
- Database schema (migrations)
- `src/lib/services/*.ts` (business logic)
- `src/app/api/**/*.ts` (API endpoints)
- `src/lib/utils/*.ts` (calculations)
- RLS policies

### Frontend Engineer
**Goal:** Build user-facing screens and UI.

1. ✅ Read: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
2. ✅ Study: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) sections 2, 15, 18, 19, 20, 21
3. ✅ Implement: Phase 5 per [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)
4. ✅ Reference: Design files in `/designs` or `source_designs/`

**Key screens:**
- Dashboard, Character/Profile, Habits, Workouts, Missions, Calendar, Analytics, Notifications

### QA / Test Engineer
**Goal:** Validate system correctness and find edge cases.

1. ✅ Read: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
2. ✅ Study: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) sections 27-28
3. ✅ Plan: 54 acceptance tests per [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) Phase 6
4. ✅ Execute: Anti-farming, timezone, offline, retries

**Key test areas:** XP awards, level-ups, rank promotions, badge unlocks, anti-farming, edge cases

---

## 🔍 Search by Topic

### Three Vectors
- Overview: [00_PROJECT_SUMMARY.md](./00_PROJECT_SUMMARY.md) (Section: "Three Vectors")
- Complete: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Sections 1, 5, 6, 10-14)
- Quick ref: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Table: "Three Vectors")

### XP System
- Design: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 4)
- Formulas: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "Core Formulas")
- Code: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "Common Code Snippets")
- SQL: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "SQL Queries")

### Levels & Progression
- Vector levels: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 5)
- Character level: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 6)
- Rank ladder: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 8)
- Formulas: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "Core Formulas")

### Harmony & Balance
- Design: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 7)
- Formula: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Harmony Score section)
- ⚠️ **Needs confirmation**

### Habits & Streaks
- Design: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 10)
- Logic: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "Habit Logic")
- Database: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "Database Tables")

### Nutrition
- Design: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 11)
- Logic: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "Nutrition Logic")
- Database: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "Database Tables")

### Workouts & PRs
- Design: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 12)
- Logic: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "Workout Logic")
- Database: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "Database Tables")

### Focus & Reading
- Design: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 13)
- Database: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "Database Tables")

### Money Actions
- Design: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 14)
- Database: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "Database Tables")

### Quests & Missions
- Quests: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 15)
- Missions: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 17)
- Database: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "Database Tables")

### Badges, Titles, Perks
- Badges: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 9.1-9.3)
- Titles: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 9.4)
- Perks: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 9.5)
- Logic: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "Badge Evaluation")

### Calendar & Analytics
- Calendar: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 18)
- Analytics: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 19)
- Read-only: Both are read-only views of authoritative data

### Notifications
- Design: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 20)
- Privacy: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 20.3)

### Profile & Identity
- Design: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 21)
- Privacy: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 21.1)

### Database & Schema
- Overview: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 22)
- Tables: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "Database Tables")
- Queries: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "SQL Queries")

### Backend Architecture
- Design: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 23)
- Flow: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "System at a Glance")

### Security & RLS
- Rules: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 24)
- Patterns: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "Common Error Patterns")

### Timezone & Date Handling
- Design: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 25)

### Edge Cases & Non-Destructive Rules
- All 25 rules: [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 27)
- Summary: [00_PROJECT_SUMMARY.md](./00_PROJECT_SUMMARY.md) (Section: "Non-Negotiable Rules")

### Acceptance Tests
- Complete list (54 tests): [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) (Section 28)
- Checklist: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Section: "Testing Checklist")

---

## 📊 Document Statistics

| Document | Lines | Focus | Audience |
|----------|-------|-------|----------|
| logic.md | 2,087 | Authoritative spec | Technical |
| LOGIC_ANALYSIS.md | ~3,000 | Deep analysis | Technical |
| IMPLEMENTATION_ROADMAP.md | ~2,000 | Execution plan | Technical + PM |
| PROJECT_ORGANIZATION.md | ~1,500 | Structure | Technical |
| QUICK_REFERENCE.md | ~1,000 | Cheat sheet | Technical |
| 00_PROJECT_SUMMARY.md | ~1,500 | Overview | Everyone |
| INDEX.md | This file | Navigation | Everyone |

**Total:** ~11,000 lines of documentation

---

## 🚀 Getting Started (First Time)

### Day 1
1. ✅ Read [00_PROJECT_SUMMARY.md](./00_PROJECT_SUMMARY.md) — 10 minutes
2. ✅ Scan [SYSTEM_ARCHITECTURE_DIAGRAM.png](./SYSTEM_ARCHITECTURE_DIAGRAM.png) — 2 minutes
3. ✅ Skim [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) first few sections — 10 minutes

### Day 2
1. ✅ Read [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) sections 1-3 (System Model, Navigation, Vocabulary) — 20 minutes
2. ✅ Read [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) sections 4-6 (XP, Levels, Harmony) — 30 minutes
3. ✅ Confirm product decisions needed — 15 minutes

### Day 3
1. ✅ Decide your role: Backend, Frontend, QA, Product, Lead
2. ✅ Follow "By Role" guidance in this INDEX
3. ✅ Start Phase 1 or begin reading domain specs

---

## 🔗 Cross-References

### From logic.md → LOGIC_ANALYSIS.md
Every section of logic.md is expanded and analyzed in LOGIC_ANALYSIS.md:
- logic.md Section 4 → LOGIC_ANALYSIS.md "XP System" section
- logic.md Section 8 → LOGIC_ANALYSIS.md "Rank and Tier Ladder" section
- etc.

### From IMPLEMENTATION_ROADMAP.md → QUICK_REFERENCE.md
Roadmap tasks reference code snippets in quick reference:
- Phase 1 Task 1.2 → See QUICK_REFERENCE.md "Award XP" section
- Phase 4 Task 4.1 → See QUICK_REFERENCE.md "Habit Logic" section

### From PROJECT_ORGANIZATION.md → Source Code
Folder structure maps to implementation:
- `/src/lib/services/` → Where business logic lives
- `/src/app/api/` → Where endpoints live
- `/config/` → Where configuration lives

---

## ✅ Checklist: Before Building

**MUST DO:**
- [ ] Read 00_PROJECT_SUMMARY.md
- [ ] Review LOGIC_ANALYSIS.md at least once
- [ ] Confirm all 14 product decisions
- [ ] Review folder structure (PROJECT_ORGANIZATION.md)
- [ ] Understand Phase 1 tasks (IMPLEMENTATION_ROADMAP.md)

**GOOD TO DO:**
- [ ] Watch SYSTEM_ARCHITECTURE_DIAGRAM.png
- [ ] Scan QUICK_REFERENCE.md
- [ ] Review existing design files
- [ ] Set up folder structure

**DO NOT SKIP:**
- [ ] The immutability rules (Section 27 of LOGIC_ANALYSIS.md)
- [ ] The idempotency pattern (QUICK_REFERENCE.md)
- [ ] The security rules (Section 24 of LOGIC_ANALYSIS.md)

---

## 📞 Questions & Clarification

### For Logic/Rules Questions
→ Search [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) first  
→ Check [00_PROJECT_SUMMARY.md](./00_PROJECT_SUMMARY.md) "Critical Product Decisions PENDING"  
→ Reference original [logic.md](./logic.md)

### For Implementation Questions
→ See [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)  
→ Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for code patterns

### For Organization Questions
→ See [PROJECT_ORGANIZATION.md](./PROJECT_ORGANIZATION.md)

### For Debugging Questions
→ See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) "Debugging Tips"

---

## 📝 How to Update Documentation

When making changes:
1. Update the relevant document
2. Update this INDEX if structure changes
3. Update [00_PROJECT_SUMMARY.md](./00_PROJECT_SUMMARY.md) version history
4. Commit all changes together

---

## 🎯 Success Criteria: Documentation Complete

✅ All sections of logic.md explained in LOGIC_ANALYSIS.md  
✅ 6-phase roadmap with weekly tasks created  
✅ Folder structure designed and documented  
✅ Quick reference for developers created  
✅ This comprehensive index for navigation created  
✅ 14 product decisions identified and listed  
✅ Visual architecture diagram created  
✅ Code examples and patterns documented  
✅ SQL query patterns documented  
✅ Testing checklist provided  

---

## 📌 Bookmarks (For Your Browser)

Bookmark these for quick access:
1. [00_PROJECT_SUMMARY.md](./00_PROJECT_SUMMARY.md) — Overview & decisions
2. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) — Code cheat sheet
3. [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) — Timeline & tasks
4. [LOGIC_ANALYSIS.md](./LOGIC_ANALYSIS.md) — Complete spec breakdown

---

**Last Updated:** November 23, 2026  
**Status:** Complete and Ready for Implementation

---

**← Back to [00_PROJECT_SUMMARY.md](./00_PROJECT_SUMMARY.md) for overview**
