# M3 Triad — Project Structure Guide

**A visual guide to navigate the organized project.**

---

## 📁 Directory Tree

```
M3 Triad/
│
├── 📚 docs/                                  # 📖 START HERE FOR DOCUMENTATION
│   ├── START_HERE.md                         # ⭐ Entry point (read first!)
│   ├── 00_PROJECT_SUMMARY.md                 # Executive overview & navigation
│   ├── LOGIC_ANALYSIS.md                     # Complete system breakdown (20,000 words)
│   ├── IMPLEMENTATION_ROADMAP.md             # 6-phase implementation plan
│   ├── PROJECT_ORGANIZATION.md               # Folder structure & code conventions
│   ├── QUICK_REFERENCE.md                    # Developer cheat sheet
│   ├── ARCHITECTURE_DIAGRAM.txt              # System flows & diagrams
│   ├── INDEX.md                              # Complete documentation index
│   ├── DELIVERABLES.md                       # What was created & why
│   ├── 00_PROJECT_SUMMARY.md                 # (duplicate for reference)
│   ├── DESIGN_SYSTEM.md                      # Visual design guidelines
│   ├── DESIGN.md                             # UI/UX specifications
│   ├── FUNCTIONAL_SPEC.md                    # Feature specifications
│   ├── IMPLEMENTATION_GUIDE.md               # Step-by-step guide
│   ├── INFORMATION_ARCHITECTURE.md           # Site/app structure
│   ├── ASSET_GUIDE.md                        # Asset usage guide
│   ├── DATA_MODEL.md                         # Database model
│   ├── DATABASE_ARCHITECTURE.txt             # DB architecture
│   ├── DATABASE_SETUP_COMPLETE.md            # Setup status
│   ├── CONTEXT.md                            # Project context
│   ├── BUILD_SUMMARY.md                      # Build status
│   ├── DEVELOPMENT_CHECKLIST.md              # Development tasks
│   ├── DEVELOPMENT.md                        # Development guide
│   ├── FINAL_REPORT.md                       # Final summary
│   ├── FINAL_SUMMARY.txt                     # Quick summary
│   ├── LIVE_DEMO_SUMMARY.md                  # Demo notes
│   ├── NEXTJS_SETUP.md                       # Next.js setup
│   ├── OPEN_QUESTIONS.md                     # Unanswered questions
│   ├── SOURCE_REVIEW_NOTES.md                # Code review notes
│   ├── SETUP_COMPLETE.md                     # Setup status
│   ├── TESTING_CHECKLIST.md                  # Testing tasks
│   ├── URLS_AND_ACCESS.md                    # URLs & credentials
│   ├── QUICK_START.md                        # Quick start guide
│   └── [other documentation]
│
├── 🎨 designs/                               # Design assets & SVG screens
│   ├── dashboard.svg                         # Dashboard screen
│   ├── aside.svg                             # Navigation aside
│   ├── calendar.svg                          # Calendar view
│   ├── analytics.svg                         # Analytics dashboard
│   ├── habits.svg                            # Habits tracker
│   ├── missions.svg                          # Missions view
│   ├── notifications.svg                     # Notifications center
│   ├── nutrition.svg                         # Nutrition tracker
│   ├── profile.svg                           # Character profile
│   ├── workout.svg                           # Workout screen
│   └── [other design files]
│
├── ⚙️ config/                                # Configuration files (JSON)
│   ├── xp-reward-rules.json                  # ⭐ XP award configurations
│   ├── level-thresholds.json                 # ⭐ XP curves (all vectors)
│   ├── rank-requirements.json                # ⭐ Rank ladder definitions
│   └── badge-definitions.json                # ⭐ Badge catalog
│
├── 📝 src/                                   # Next.js source code
│   ├── app/
│   │   ├── (auth)/                           # Authentication routes
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── onboarding/page.tsx
│   │   ├── (dashboard)/                      # Main application routes
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── habits/page.tsx
│   │   │   ├── workouts/page.tsx
│   │   │   ├── missions/page.tsx
│   │   │   ├── character/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   ├── calendar/page.tsx
│   │   │   └── notifications/page.tsx
│   │   ├── api/                              # API routes by domain
│   │   │   ├── habits/
│   │   │   ├── workouts/
│   │   │   ├── nutrition/
│   │   │   ├── focus/
│   │   │   ├── money/
│   │   │   ├── missions/
│   │   │   ├── quests/
│   │   │   ├── character/
│   │   │   ├── progression/
│   │   │   └── [other domains]
│   │   ├── layout.tsx                        # Root layout
│   │   ├── page.tsx                          # Home page
│   │   └── providers.tsx                     # Context providers
│   │
│   ├── components/
│   │   ├── ui/                               # Reusable UI components
│   │   │   ├── Card.tsx
│   │   │   ├── FormInput.tsx
│   │   │   ├── Button.tsx
│   │   │   └── [other UI components]
│   │   ├── layouts/
│   │   │   ├── AuthLayout.tsx                # Auth page layout
│   │   │   ├── AppShell.tsx                  # Main app layout
│   │   │   └── [other layouts]
│   │   ├── screens/                          # Full-page screen components
│   │   │   ├── DashboardScreen/
│   │   │   ├── CharacterScreen/
│   │   │   ├── HabitsScreen/
│   │   │   ├── WorkoutScreen/
│   │   │   ├── MissionsScreen/
│   │   │   ├── AnalyticsScreen/
│   │   │   ├── CalendarScreen/
│   │   │   └── NotificationsScreen/
│   │   └── features/                        # Feature-specific components
│   │       ├── xp-ledger/
│   │       ├── progression/
│   │       ├── badges/
│   │       ├── ranks/
│   │       └── [other features]
│   │
│   ├── lib/
│   │   ├── supabase.ts                       # Supabase client
│   │   ├── services/                         # Business logic per domain
│   │   │   ├── progression.ts                # XP, levels, rank logic
│   │   │   ├── habits.ts                     # Habit management
│   │   │   ├── workouts.ts                   # Workout logic
│   │   │   ├── nutrition.ts                  # Nutrition tracking
│   │   │   ├── missions.ts                   # Mission management
│   │   │   ├── focus.ts                      # Focus sessions
│   │   │   ├── money.ts                      # Money actions
│   │   │   ├── quests.ts                     # Quest management
│   │   │   ├── badge-service.ts              # Badge evaluation
│   │   │   ├── rank-service.ts               # Rank promotion
│   │   │   └── notifications.ts              # Notification delivery
│   │   ├── utils/                            # Utility functions
│   │   │   ├── xp-calculator.ts              # XP calculations
│   │   │   ├── level-calculator.ts           # Level derivation
│   │   │   ├── harmony-calculator.ts         # Harmony score
│   │   │   ├── date-utils.ts                 # Timezone handling
│   │   │   ├── validators.ts                 # Data validation
│   │   │   └── [other utilities]
│   │   ├── constants/                        # Constants & config
│   │   │   ├── xp-curves.ts                  # XP thresholds
│   │   │   ├── rank-definitions.ts           # Rank specs
│   │   │   ├── badge-catalog.ts              # Badge definitions
│   │   │   └── [other constants]
│   │   ├── hooks/                            # React hooks
│   │   │   ├── useProgression.ts             # Progression context
│   │   │   ├── useVectorLevel.ts             # Vector level hook
│   │   │   ├── useCharacterLevel.ts          # Character level hook
│   │   │   └── [other hooks]
│   │   └── validators/                       # Validation logic
│   │       ├── xp-rules.ts
│   │       ├── domain-data.ts
│   │       └── [other validators]
│   │
│   ├── styles/
│   │   ├── globals.css                       # Global styles
│   │   └── [component styles]
│   │
│   └── types/
│       ├── database.ts                       # Database types
│       ├── progression.ts                    # XP & progression types
│       ├── domain.ts                         # Domain-specific types
│       └── [other types]
│
├── 🗄️ supabase/                              # Supabase-specific
│   ├── functions/                            # Edge functions
│   │   ├── award-xp/
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   └── README.md
│   │   ├── process-habit-completion/
│   │   ├── process-workout-completion/
│   │   ├── process-mission-event/
│   │   └── [other functions]
│   └── rls-policies/                         # Row-level security SQL
│       ├── xp_ledger.sql
│       ├── user_badges.sql
│       ├── progressions.sql
│       └── [other policies]
│
├── 📋 scripts/                               # Setup & utility scripts
│   ├── setup-database.js                     # Database setup
│   ├── create-demo-account.js                # Demo account creation
│   ├── verify-setup.js                       # Setup verification
│   ├── verify-schema.js                      # Schema verification
│   ├── test-connection.js                    # Connection test
│   ├── check-tables-direct.sql               # Direct SQL checks
│   └── [other scripts]
│
├── 🧪 tests/                                 # Test files
│   ├── unit/                                 # Unit tests
│   │   ├── xp-calculator.test.ts
│   │   ├── level-calculator.test.ts
│   │   ├── harmony-calculator.test.ts
│   │   └── [other unit tests]
│   ├── integration/                          # Integration tests
│   │   ├── progression.test.ts
│   │   ├── habits.test.ts
│   │   ├── workouts.test.ts
│   │   ├── xp-award.test.ts
│   │   └── [other integration tests]
│   └── e2e/                                  # End-to-end tests
│       ├── user-progression.test.ts
│       ├── rank-promotion.test.ts
│       └── [other e2e tests]
│
├── 🔄 migrations/                            # Database migrations
│   ├── [auto-generated from Supabase]
│   └── [create new as needed]
│
├── 📂 node_modules/                          # Dependencies (not in git)
│
├── .next/                                    # Build output
│
├── 🌐 .env.local                             # Environment variables (local)
├── .eslintrc.json                            # ESLint config
├── .gitignore                                # Git ignore rules
├── package.json                              # Dependencies
├── package-lock.json                         # Dependency lock
├── tsconfig.json                             # TypeScript config
├── next.config.js                            # Next.js config
│
├── README.md                                 # Project overview ⭐
├── STRUCTURE.md                              # This file
│
└── 📂 .git/                                  # Git repository
```

---

## 🎯 Where to Find Things

### Documentation
- **Starting point:** `/docs/START_HERE.md`
- **Overview:** `/docs/00_PROJECT_SUMMARY.md`
- **Code examples:** `/docs/QUICK_REFERENCE.md`
- **Full specs:** `/docs/LOGIC_ANALYSIS.md`
- **Implementation:** `/docs/IMPLEMENTATION_ROADMAP.md`
- **Organization:** `/docs/PROJECT_ORGANIZATION.md`
- **System diagrams:** `/docs/ARCHITECTURE_DIAGRAM.txt`
- **Navigation:** `/docs/INDEX.md`

### Configuration
- **XP rewards:** `/config/xp-reward-rules.json`
- **Level curves:** `/config/level-thresholds.json`
- **Rank ladder:** `/config/rank-requirements.json`
- **Badges:** `/config/badge-definitions.json`

### Code (by feature)
- **Habits:** `/src/lib/services/habits.ts`
- **Workouts:** `/src/lib/services/workouts.ts`
- **Nutrition:** `/src/lib/services/nutrition.ts`
- **Money:** `/src/lib/services/money.ts`
- **Missions:** `/src/lib/services/missions.ts`
- **Progression:** `/src/lib/services/progression.ts`
- **XP Calculator:** `/src/lib/utils/xp-calculator.ts`

### Database
- **Migrations:** `/migrations/`
- **Edge functions:** `/supabase/functions/`
- **RLS policies:** `/supabase/rls-policies/`

### Testing
- **Unit tests:** `/tests/unit/`
- **Integration tests:** `/tests/integration/`
- **E2E tests:** `/tests/e2e/`

### Scripts
- **Setup scripts:** `/scripts/`

---

## 📖 Reading Path by Role

### 🔧 Engineer
```
1. README.md                     (5 min)
2. docs/START_HERE.md            (10 min)
3. docs/QUICK_REFERENCE.md       (30 min)
4. docs/IMPLEMENTATION_ROADMAP.md (1 hour, focus on your phase)
5. code/services/[domain].ts     (as you implement)
```

### 📊 Product Manager
```
1. README.md                      (5 min)
2. docs/00_PROJECT_SUMMARY.md     (20 min)
3. Confirm 14 product decisions
4. docs/LOGIC_ANALYSIS.md         (reference as needed)
```

### 👔 Tech Lead
```
1. README.md                       (5 min)
2. docs/00_PROJECT_SUMMARY.md      (20 min)
3. docs/PROJECT_ORGANIZATION.md    (30 min)
4. docs/IMPLEMENTATION_ROADMAP.md  (1 hour)
5. Set up folder structure
6. Assign phases to team
```

### 🧪 QA Engineer
```
1. README.md                      (5 min)
2. docs/QUICK_REFERENCE.md        (focus on testing section)
3. docs/IMPLEMENTATION_ROADMAP.md (phase 6 - validation)
4. Create test plans for 54 acceptance tests
```

---

## ✅ Implementation Checklist

### Phase 1: Data Foundation
- [ ] Read `/docs/IMPLEMENTATION_ROADMAP.md` Phase 1
- [ ] Inspect existing database schema
- [ ] Create `progression_events` table
- [ ] Create `xp_ledger` table
- [ ] Create caching tables
- [ ] Add RLS policies
- [ ] Write database tests

### Phase 2: Core Progression
- [ ] Implement `/src/lib/services/progression.ts`
- [ ] Implement `/src/lib/utils/xp-calculator.ts`
- [ ] Implement `/src/lib/utils/level-calculator.ts`
- [ ] Review `config/` files
- [ ] Create rank eligibility logic
- [ ] Add notifications

### Phases 3-6
- [ ] Follow `/docs/IMPLEMENTATION_ROADMAP.md` by phase
- [ ] Reference `/docs/QUICK_REFERENCE.md` for patterns
- [ ] Check `/docs/LOGIC_ANALYSIS.md` for specs
- [ ] Write tests in `/tests/`

---

## 🔄 Git Workflow

```bash
# Keep these in git
docs/                       # All documentation
config/                     # Configuration files
src/                        # Source code
supabase/                   # Edge functions & policies
scripts/                    # Setup scripts
tests/                      # Test files
migrations/                 # Database migrations
README.md
STRUCTURE.md
package.json
tsconfig.json
.gitignore
.eslintrc.json

# Do NOT commit
node_modules/               # Add to .gitignore
.next/                      # Add to .gitignore
.env.local                  # Add to .gitignore (keep .env.example)
```

---

## 📝 Adding New Files

### New Documentation
```
docs/NEW_FEATURE.md         # Add to docs/
Then reference in docs/INDEX.md
```

### New Service/Domain Logic
```
src/lib/services/new-domain.ts      # Create here
src/app/api/new-domain/route.ts     # Create API route
tests/unit/new-domain.test.ts       # Create tests
```

### New Configuration
```
config/new-config.json              # Create here
Reference in src/lib/constants/
Add to .gitignore if secrets
```

### New Utility
```
src/lib/utils/new-util.ts           # Create here
tests/unit/new-util.test.ts         # Create tests
```

---

## 🎨 Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Services | camelCase | `habitService.ts` |
| Utils | camelCase | `xpCalculator.ts` |
| Components | PascalCase | `DashboardScreen.tsx` |
| Hooks | useXxx | `useProgression.ts` |
| Types | PascalCase | `ProgressionState.ts` |
| Config | kebab-case | `xp-reward-rules.json` |
| SQL | snake_case | `xp_ledger.sql` |
| Folders | kebab-case or lowercase | `services/`, `utils/` |

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Check database setup
node scripts/verify-setup.js

# Create demo account
node scripts/create-demo-account.js
```

---

## 📞 Quick Reference

| Need | Location |
|------|----------|
| "How do I implement habits?" | `/docs/QUICK_REFERENCE.md` → Habit Logic |
| "What's the XP formula?" | `/docs/QUICK_REFERENCE.md` → Core Formulas |
| "Where's the rank logic?" | `/src/lib/services/rank-service.ts` |
| "How do I test this?" | `/tests/` or `/docs/QUICK_REFERENCE.md` → Testing |
| "What configuration exists?" | `/config/` |
| "Full system spec?" | `/docs/LOGIC_ANALYSIS.md` |

---

**Last Updated:** November 25, 2026

**Next:** Read [docs/START_HERE.md](./docs/START_HERE.md) for quick orientation!
