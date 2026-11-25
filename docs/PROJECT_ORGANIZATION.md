# M3 Triad — Project Organization & Structure

**Purpose:** Organize folders, files, and documentation for clear navigation and maintainability.

**Current State:** 51 files at root level + scattered docs + src/ and node_modules/

---

## Recommended Folder Structure

```
D:\Projects\M3 Triad\
│
├── docs/                          # Documentation (organized by topic)
│   ├── LOGIC.md                   # Main logic specification (from logic.md)
│   ├── ARCHITECTURE.md            # System architecture and design
│   ├── DATABASE_SCHEMA.md         # Supabase/PostgreSQL schema
│   ├── API_SPECIFICATION.md       # API endpoints and contracts
│   ├── DESIGN_SYSTEM.md           # (existing, move here)
│   ├── FUNCTIONAL_SPEC.md         # (existing, move here)
│   ├── IMPLEMENTATION_GUIDE.md    # (existing, move here)
│   ├── DESIGN.md                  # (existing, move here)
│   ├── INFORMATION_ARCHITECTURE.md# (existing, move here)
│   ├── ASSET_GUIDE.md             # (existing, move here)
│   └── QUICK_REFERENCE.md         # (existing, move here)
│
├── designs/                       # SVG designs and design assets
│   ├── dashboard.svg              # (move SCREENS/ files here)
│   ├── aside.svg
│   ├── calendar.svg
│   ├── analytics.svg
│   ├── habits.svg
│   ├── missions.svg
│   ├── notifications.svg
│   ├── nutrition.svg
│   ├── profile.svg
│   └── workout.svg
│
├── migrations/                    # Database migrations (existing)
│   └── [migration files]
│
├── src/                           # Next.js source code
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── onboarding/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── habits/
│   │   │   ├── workouts/
│   │   │   ├── missions/
│   │   │   ├── character/
│   │   │   ├── analytics/
│   │   │   ├── calendar/
│   │   │   └── notifications/
│   │   ├── api/                   # API routes
│   │   │   ├── progression/
│   │   │   ├── habits/
│   │   │   ├── workouts/
│   │   │   ├── missions/
│   │   │   ├── nutrition/
│   │   │   ├── character/
│   │   │   └── [other domains]/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── providers.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Card.tsx           # (existing)
│   │   │   ├── FormInput.tsx       # (existing)
│   │   │   └── [other UI components]
│   │   ├── layouts/
│   │   │   ├── AuthLayout.tsx     # (existing)
│   │   │   ├── AppShell.tsx       # (existing)
│   │   │   └── [other layouts]
│   │   ├── screens/
│   │   │   ├── DashboardScreen/
│   │   │   ├── CharacterScreen/
│   │   │   ├── HabitsScreen/
│   │   │   ├── WorkoutScreen/
│   │   │   ├── MissionsScreen/
│   │   │   ├── AnalyticsScreen/
│   │   │   ├── CalendarScreen/
│   │   │   └── NotificationsScreen/
│   │   └── features/
│   │       ├── xp-ledger/
│   │       ├── progression/
│   │       ├── badges/
│   │       ├── ranks/
│   │       └── [other features]
│   ├── lib/
│   │   ├── supabase.ts            # (existing)
│   │   ├── services/
│   │   │   ├── progression.ts     # XP, levels, rank logic
│   │   │   ├── habits.ts
│   │   │   ├── workouts.ts
│   │   │   ├── nutrition.ts
│   │   │   ├── missions.ts
│   │   │   └── [other services]
│   │   ├── utils/
│   │   │   ├── xp-calculator.ts   # XP calculations
│   │   │   ├── level-calculator.ts
│   │   │   ├── harmony-calculator.ts
│   │   │   ├── date-utils.ts      # Timezone handling
│   │   │   └── [other utilities]
│   │   ├── validators/
│   │   │   ├── xp-rules.ts
│   │   │   ├── domain-data.ts
│   │   │   └── [other validators]
│   │   ├── constants/
│   │   │   ├── xp-curves.ts       # XP threshold tables
│   │   │   ├── rank-definitions.ts
│   │   │   └── [other constants]
│   │   └── hooks/
│   │       ├── useProgression.ts
│   │       ├── useVectorLevel.ts
│   │       └── [other hooks]
│   ├── styles/                    # CSS/Tailwind
│   │   └── [existing style files]
│   └── types/
│       ├── database.ts            # (existing)
│       ├── progression.ts         # XP, levels, ranks
│       ├── domain.ts              # Habits, workouts, etc.
│       └── [other types]
│
├── supabase/                      # Supabase-specific files
│   ├── functions/                 # Edge functions for XP processing
│   │   ├── award-xp/
│   │   ├── process-habit-completion/
│   │   ├── process-workout-completion/
│   │   ├── process-mission-event/
│   │   └── [other functions]
│   └── rls-policies/              # Row-level security policies
│       ├── xp_ledger.sql
│       ├── user_badges.sql
│       ├── progressions.sql
│       └── [other policies]
│
├── scripts/                       # Setup, migration, testing scripts
│   ├── setup-database.js          # (existing, move here)
│   ├── create-demo-account.js     # (existing, move here)
│   ├── verify-setup.js            # (existing, move here)
│   ├── verify-schema.js           # (existing, move here)
│   ├── test-connection.js         # (existing, move here)
│   ├── seed-config.js             # Seed XP rules, badges, ranks
│   ├── rebuild-xp.js              # Rebuild cached XP from ledger
│   └── [other scripts]
│
├── tests/                         # Test files
│   ├── unit/
│   │   ├── xp-calculator.test.ts
│   │   ├── level-calculator.test.ts
│   │   ├── harmony-calculator.test.ts
│   │   └── [other unit tests]
│   ├── integration/
│   │   ├── progression.test.ts
│   │   ├── habits.test.ts
│   │   ├── workouts.test.ts
│   │   └── [other integration tests]
│   └── e2e/
│       ├── user-progression.test.ts
│       ├── rank-promotion.test.ts
│       └── [other e2e tests]
│
├── config/                        # Configuration files
│   ├── xp-reward-rules.json       # Configurable reward table
│   ├── level-thresholds.json      # XP curves (all three vectors + character)
│   ├── rank-requirements.json     # Rank ladder configuration
│   ├── badge-definitions.json     # Badge catalog
│   └── [other configs]
│
├── .env.local                     # (existing, keep at root)
├── .eslintrc.json                 # (existing, keep at root)
├── .gitignore                     # (existing, keep at root)
├── package.json                   # (existing, keep at root)
├── package-lock.json              # (existing, keep at root)
├── tsconfig.json                  # (existing, keep at root)
├── next.config.js                 # (existing, keep at root)
│
├── README.md                      # Main project overview
├── LOGIC_ANALYSIS.md              # (newly created)
├── PROJECT_ORGANIZATION.md        # This file
│
└── [root docs - to be archived/moved]
    ├── 00_READ_ME_FIRST.txt       # → docs/START.md
    ├── 00_START_HERE_AFTER_BUILD.md → docs/START_HERE.md
    ├── START_HERE.md              # → docs/START_HERE.md
    ├── BUILD_SUMMARY.md           # → docs/BUILD_SUMMARY.md
    ├── CONTEXT.md                 # → docs/PROJECT_CONTEXT.md
    ├── DATABASE_ARCHITECTURE.txt  # → docs/DATABASE_ARCHITECTURE.md
    ├── DATABASE_SETUP_COMPLETE.md # → docs/DATABASE_SETUP.md
    ├── DELIVERABLES.md            # → docs/DELIVERABLES.md
    ├── DEVELOPMENT_CHECKLIST.md   # → docs/DEVELOPMENT.md
    ├── DEVELOPMENT.md             # → docs/DEVELOPMENT.md
    ├── FINAL_REPORT.md            # → docs/FINAL_REPORT.md
    ├── FINAL_SUMMARY.txt          # → docs/FINAL_SUMMARY.md
    ├── LIVE_DEMO_SUMMARY.md       # → docs/LIVE_DEMO.md
    ├── NEXTJS_SETUP.md            # → docs/SETUP.md
    ├── OPEN_QUESTIONS.md          # → docs/OPEN_QUESTIONS.md
    ├── QUICK_START.md             # → docs/QUICK_START.md
    ├── SETUP_COMPLETE.md          # → docs/SETUP.md
    ├── SOURCE_REVIEW_NOTES.md     # → docs/SOURCE_REVIEW.md
    ├── TESTING_CHECKLIST.md       # → docs/TESTING.md
    ├── URLS_AND_ACCESS.md         # → docs/ACCESS.md
    └── [other root docs]
```

---

## File Organization Checklist

### Phase 1: Create New Folder Structure
- [ ] Create `/docs` folder
- [ ] Create `/designs` folder
- [ ] Create `/supabase/functions` folder
- [ ] Create `/supabase/rls-policies` folder
- [ ] Create `/scripts` folder
- [ ] Create `/tests` folder
- [ ] Create `/config` folder

### Phase 2: Move Documentation Files
- [ ] Move DESIGN.md → docs/
- [ ] Move DESIGN_SYSTEM.md → docs/
- [ ] Move FUNCTIONAL_SPEC.md → docs/
- [ ] Move IMPLEMENTATION_GUIDE.md → docs/
- [ ] Move INFORMATION_ARCHITECTURE.md → docs/
- [ ] Move ASSET_GUIDE.md → docs/
- [ ] Move QUICK_REFERENCE.md → docs/
- [ ] Move CONTEXT.md → docs/PROJECT_CONTEXT.md
- [ ] Move DATABASE_ARCHITECTURE.txt → docs/DATABASE_ARCHITECTURE.md
- [ ] Move DATABASE_SETUP_COMPLETE.md → docs/DATABASE_SETUP.md
- [ ] Move DELIVERABLES.md → docs/
- [ ] Move DEVELOPMENT.md → docs/
- [ ] Move DEVELOPMENT_CHECKLIST.md → docs/
- [ ] Move FINAL_REPORT.md → docs/
- [ ] Move FINAL_SUMMARY.txt → docs/
- [ ] Move LIVE_DEMO_SUMMARY.md → docs/
- [ ] Move NEXTJS_SETUP.md → docs/SETUP.md
- [ ] Move OPEN_QUESTIONS.md → docs/
- [ ] Move QUICK_START.md → docs/
- [ ] Move SOURCE_REVIEW_NOTES.md → docs/
- [ ] Move SETUP_COMPLETE.md → docs/
- [ ] Move TESTING_CHECKLIST.md → docs/
- [ ] Move URLS_AND_ACCESS.md → docs/ACCESS.md
- [ ] Copy logic.md → docs/LOGIC.md

### Phase 3: Move Design Files
- [ ] Move source_designs/ contents → designs/
- [ ] Rename to match naming convention (dashboard.svg, etc.)

### Phase 4: Move Scripts
- [ ] Move setup-database.js → scripts/
- [ ] Move create-demo-account.js → scripts/
- [ ] Move verify-setup.js → scripts/
- [ ] Move verify-schema.js → scripts/
- [ ] Move test-connection.js → scripts/

### Phase 5: Create Remaining Folder Structure in src/
- [ ] Create src/app/(auth)/ folder structure
- [ ] Create src/app/(dashboard)/ folder structure
- [ ] Create src/app/api/ folder structure
- [ ] Create src/components/screens/ folder
- [ ] Create src/components/features/ folder
- [ ] Create src/lib/services/ folder
- [ ] Create src/lib/utils/ folder
- [ ] Create src/lib/validators/ folder
- [ ] Create src/lib/constants/ folder
- [ ] Create src/lib/hooks/ folder
- [ ] Create src/types/ files (if needed)

### Phase 6: Create Configuration Files
- [ ] Create /config/xp-reward-rules.json
- [ ] Create /config/level-thresholds.json
- [ ] Create /config/rank-requirements.json
- [ ] Create /config/badge-definitions.json

### Phase 7: Create Test Structure
- [ ] Create tests/unit/ folder
- [ ] Create tests/integration/ folder
- [ ] Create tests/e2e/ folder

### Phase 8: Create Supabase Functions & Policies
- [ ] Create supabase/functions/award-xp/
- [ ] Create supabase/functions/process-habit-completion/
- [ ] Create supabase/functions/process-workout-completion/
- [ ] Create supabase/functions/process-mission-event/
- [ ] Create supabase/rls-policies/ folder with SQL files

### Phase 9: Cleanup Root Directory
- [ ] Keep only: config files, package files, .env.local, README.md, .gitignore
- [ ] Archive or delete: redundant docs at root
- [ ] Update .gitignore if needed

---

## Documentation Organization Strategy

### Hierarchy
1. **README.md** — Main entry point
2. **docs/** — All detailed documentation
   - Start guides (QUICK_START.md, START_HERE.md)
   - Architecture (ARCHITECTURE.md, DATABASE_SCHEMA.md, API_SPECIFICATION.md)
   - Specifications (LOGIC.md, DESIGN_SYSTEM.md, FUNCTIONAL_SPEC.md)
   - Implementation (IMPLEMENTATION_GUIDE.md, DEVELOPMENT.md)
   - Setup (SETUP.md, DATABASE_SETUP.md)
   - Reference (QUICK_REFERENCE.md, ASSET_GUIDE.md)
   - Project (PROJECT_CONTEXT.md, DELIVERABLES.md, FINAL_REPORT.md)

### Reading Order for New Developer
1. README.md
2. docs/QUICK_START.md
3. docs/PROJECT_CONTEXT.md
4. docs/LOGIC.md (this file)
5. docs/ARCHITECTURE.md
6. docs/DATABASE_SCHEMA.md
7. docs/IMPLEMENTATION_GUIDE.md

---

## Source Code Organization Strategy

### By Domain (Feature-Based)
```
src/app/api/
├── habits/          # Habit/Protocol domain
├── workouts/        # Workout domain
├── nutrition/       # Nutrition domain
├── focus/           # Focus sessions domain
├── money/           # Money actions domain
├── missions/        # Mission domain
├── quests/          # Quest domain
├── character/       # Character/progression domain
└── progression/     # Cross-cutting XP logic
```

### By Concern (Vertical Slicing)
Each domain can follow:
- API route handlers
- Service logic (business rules)
- Database queries
- Validators/guards
- Types/interfaces

### Component Organization
- **UI components** → `components/ui/` (generic, reusable)
- **Layout components** → `components/layouts/` (page structure)
- **Screen components** → `components/screens/` (full page features)
- **Feature components** → `components/features/` (business logic)

---

## Configuration Management

### Environment
- `.env.local` — Local development (secrets, URLs)
- `.env.example` — Template for environment variables

### Application Config
- `config/xp-reward-rules.json` — Configurable XP awards
- `config/level-thresholds.json` — XP curves
- `config/rank-requirements.json` — Rank ladder
- `config/badge-definitions.json` — Badge catalog

### Why JSON over Code?
- Easy to adjust values without redeploying
- Product can tweak rewards quickly
- Changes are version-controlled
- Can be managed separately from code

---

## Database & Supabase Organization

### SQL Files
- `/migrations/` — Supabase auto-generated migrations
- `/supabase/rls-policies/` — Row-level security SQL
- `/supabase/functions/` — Edge functions (TypeScript)

### Edge Functions Structure
Each function has:
- `index.ts` — Main function
- `types.ts` — Request/response types
- `validators.ts` — Input validation
- `services.ts` — Business logic
- `README.md` — Documentation

---

## Testing Organization

### Unit Tests (`tests/unit/`)
- Pure functions (calculators, validators)
- No database or API calls
- Fast, isolated tests
- Example: `xp-calculator.test.ts`

### Integration Tests (`tests/integration/`)
- Domain logic with database
- Service layer tests
- Example: `progression.test.ts`

### E2E Tests (`tests/e2e/`)
- Full user flows
- API endpoints to database
- Example: `user-progression.test.ts` (simulate 7-day progression)

---

## Key Principles

### 1. Single Responsibility
Each file has one clear purpose. Functions, components, services are focused.

### 2. Separation of Concerns
- Presentation (components) ≠ Business logic (services) ≠ Data access (queries)
- Domains own their source records
- XP ledger is centralized and immutable

### 3. Auditability
- Configuration is explicit and versioned
- Decisions are documented in comments
- File structure reflects the system model

### 4. Scalability
- Easy to add new domains (copy pattern)
- Easy to modify reward rules (edit JSON)
- Easy to test (isolated concerns)

### 5. Discoverability
- Folder names describe purpose clearly
- Files are named consistently
- README files explain non-obvious choices

---

## Migration Path (For Existing Project)

If the project already has code in src/, follow this priority:

### High Priority (Do First)
1. Create `/docs` folder, move all documentation
2. Create `/config` folder for XP rules, level thresholds
3. Create `/scripts` folder, move setup scripts
4. Create `/supabase` folder structure

### Medium Priority (Refactor)
1. Create `/src/lib/services/` and extract domain logic
2. Create `/src/lib/utils/` and extract utility functions
3. Create `/src/lib/constants/` for XP curves and config
4. Create `/src/components/screens/` and organize pages

### Low Priority (Polish)
1. Create `/tests` folder and add test files
2. Create `/src/components/features/` for complex features
3. Add README files to major folders

---

## File Naming Conventions

### TypeScript/React Files
- Components: `PascalCase.tsx` (e.g., `DashboardScreen.tsx`)
- Hooks: `useHookName.ts` (e.g., `useProgression.ts`)
- Utils/Services: `camelCase.ts` (e.g., `xp-calculator.ts`)
- Types: `camelCase.ts` (e.g., `progression.ts`)

### Configuration Files
- JSON: kebab-case (e.g., `xp-reward-rules.json`)
- SQL: snake_case (e.g., `xp_ledger.sql`)

### Documentation
- Markdown: UPPER_SNAKE_CASE or Title (e.g., `LOGIC.md`, `Quick Start.md`)

---

## Directory Search & Discovery

### Finding XP Logic
- Search: `src/lib/services/progression.ts`
- Tests: `tests/unit/xp-calculator.test.ts`
- Config: `config/xp-reward-rules.json`
- Spec: `docs/LOGIC.md` (Section 4)

### Finding Habit Features
- Routes: `src/app/(dashboard)/habits/`
- Components: `src/components/screens/HabitsScreen/`
- Services: `src/lib/services/habits.ts`
- API: `src/app/api/habits/`
- Spec: `docs/LOGIC.md` (Section 10)

### Finding Database Schema
- Supabase migrations: `migrations/`
- RLS policies: `supabase/rls-policies/`
- Schema docs: `docs/DATABASE_SCHEMA.md`
- Spec: `docs/LOGIC.md` (Section 22)

---

## README Template for Major Folders

Each major folder should have a `README.md`:

```markdown
# [Folder Name]

## Purpose
Brief description of what this folder contains.

## Structure
```
folder/
├── file1.ts
├── file2.ts
└── [structure]
```

## Key Files
- `important-file.ts` — Description

## Related Documentation
- `docs/RELEVANT_SECTION.md` — Link to spec
- Link to other related folders

## Examples
Brief usage example if applicable.
```

---

## Maintenance Notes

### When Adding New Features
1. Create feature in relevant domain folder
2. Add corresponding spec to `docs/`
3. Add configuration to `config/` if needed
4. Add tests to `tests/`
5. Update relevant README files

### When Modifying XP Rules
1. Update `config/xp-reward-rules.json`
2. Update `docs/LOGIC.md` if needed
3. Update tests in `tests/unit/xp-calculator.test.ts`
4. Create migration if database changes needed

### When Adding New Domain
1. Create `src/lib/services/[domain].ts`
2. Create `src/app/api/[domain]/` routes
3. Create `src/components/screens/[Domain]Screen/`
4. Create corresponding tests
5. Document in `docs/LOGIC.md`

---

## Summary

This organization structure:
✅ **Mirrors the system architecture** — Domains are clearly separated  
✅ **Scales with complexity** — Easy to add features without chaos  
✅ **Supports collaboration** — Clear ownership and structure  
✅ **Enables discoverability** — New developers can navigate quickly  
✅ **Maintains auditability** — Configuration and decisions are explicit  
✅ **Follows Next.js conventions** — Familiar to React ecosystem  

---

**Ready to implement?** Start with Phase 1 and work through sequentially.
