# M3 Triad Development Checklist

## Setup Phase ✅

- [x] Supabase project created
- [x] Database credentials configured
- [x] `.env.local` created with credentials
- [x] `.gitignore` configured
- [x] Supabase connection verified
- [x] Database schema created (24 tables)
- [x] Row Level Security (RLS) enabled
- [x] TypeScript types generated
- [x] Supabase utilities implemented
- [x] Documentation completed
- [x] Setup verification passed (13/13)

---

## Foundation Phase (Next)

- [ ] Create Next.js app structure
- [ ] Install dependencies: `npm install`
- [ ] Verify dev server: `npm run dev`
- [ ] Configure TypeScript paths (`tsconfig.json`)
- [ ] Set up Tailwind CSS
- [ ] Create layout with Providers
- [ ] Set up Auth context provider
- [ ] Create global styles

---

## Authentication (Core Requirement)

- [ ] Sign Up page
  - [ ] Email input
  - [ ] Password input
  - [ ] Sign up button
  - [ ] Error handling
  - [ ] Success redirect to onboarding
  - [ ] Link to sign in

- [ ] Sign In page
  - [ ] Email input
  - [ ] Password input
  - [ ] Sign in button
  - [ ] Error handling
  - [ ] Success redirect to dashboard
  - [ ] Link to sign up
  - [ ] "Forgot password" (optional)

- [ ] Protected Routes
  - [ ] Middleware to check auth
  - [ ] Redirect to login if not authenticated
  - [ ] Persist session across page reloads

- [ ] Sign Out
  - [ ] Sign out button (in header/menu)
  - [ ] Clear session
  - [ ] Redirect to sign in

---

## Dashboard (Core Feature)

- [ ] Display character stats
  - [ ] Level
  - [ ] Rank
  - [ ] Total XP
  - [ ] Progress bar to next level

- [ ] Display tri-vector progress
  - [ ] Mind: level/xp
  - [ ] Money: level/xp
  - [ ] Muscle: level/xp

- [ ] Show active missions
  - [ ] List top 5 missions
  - [ ] Show status
  - [ ] Show deadline
  - [ ] Link to detail

- [ ] Show today's habits
  - [ ] List daily habits
  - [ ] Check-in buttons
  - [ ] Show streak count

- [ ] Quick actions
  - [ ] New mission button
  - [ ] New habit button
  - [ ] Log workout button
  - [ ] Log meal button
  - [ ] Start focus session button

- [ ] Recent activity
  - [ ] Last 5 XP events
  - [ ] Show source (task, workout, habit)
  - [ ] Show XP amount
  - [ ] Show timestamp

---

## Missions & Tasks

- [ ] Missions List Page
  - [ ] List all missions
  - [ ] Filter by status (active, draft, completed)
  - [ ] Sort by deadline
  - [ ] Create new button
  - [ ] Link to detail page

- [ ] Mission Detail Page
  - [ ] Show mission info (title, description, goal)
  - [ ] Show deadline and status
  - [ ] Display milestones
  - [ ] Display tasks
  - [ ] Show progress %
  - [ ] Edit button
  - [ ] Archive button

- [ ] Create Mission
  - [ ] Title input
  - [ ] Description input
  - [ ] Vector selector (Mind/Money/Muscle)
  - [ ] Goal input
  - [ ] Start date picker
  - [ ] Deadline picker
  - [ ] Create button
  - [ ] Cancel button

- [ ] Task Management
  - [ ] Create task button
  - [ ] Task list with status badges
  - [ ] Check task complete
  - [ ] Edit task
  - [ ] Delete task
  - [ ] Show due date
  - [ ] Show priority
  - [ ] Show estimate

- [ ] Milestones
  - [ ] Display milestone list
  - [ ] Create milestone button
  - [ ] Mark complete
  - [ ] Delete milestone

---

## Habits

- [ ] Habits List Page
  - [ ] List all active habits
  - [ ] Group by vector (Mind/Money/Muscle)
  - [ ] Show frequency (daily/weekly)
  - [ ] Show current streak
  - [ ] Create new button

- [ ] Habit Detail Page
  - [ ] Show habit name and description
  - [ ] Show vector, frequency, schedule
  - [ ] Show check-in history (last 30 days)
  - [ ] Show streak statistics
  - [ ] Edit button
  - [ ] Pause/Resume button
  - [ ] Delete button

- [ ] Create Habit
  - [ ] Name input
  - [ ] Description input
  - [ ] Vector selector
  - [ ] Frequency selector (daily/weekly/custom)
  - [ ] Schedule picker (time/days)
  - [ ] Create button

- [ ] Check-In
  - [ ] Check-in button for each habit
  - [ ] Show "checked in today" state
  - [ ] Update streak display
  - [ ] Award XP (backend)
  - [ ] Confirmation feedback

---

## Workouts

- [ ] Workout Routines Page
  - [ ] List saved routines
  - [ ] Create new routine button
  - [ ] Edit routine button
  - [ ] Delete routine button
  - [ ] Start workout button

- [ ] Create/Edit Routine
  - [ ] Routine name input
  - [ ] Add exercises
  - [ ] Set target sets/reps for each
  - [ ] Reorder exercises
  - [ ] Remove exercises
  - [ ] Save button

- [ ] Workout Session (Active)
  - [ ] Show routine name
  - [ ] Show current exercise
  - [ ] Log set button
  - [ ] Input: load, reps, type, RPE/RIR
  - [ ] Show previous sets (progression)
  - [ ] Next exercise button
  - [ ] Rest timer
  - [ ] Pause/Resume buttons
  - [ ] End workout button

- [ ] Log Set
  - [ ] Load input
  - [ ] Reps input
  - [ ] Unit selector (kg/lb)
  - [ ] Set type selector (working/warmup/etc)
  - [ ] RPE/RIR inputs (optional)
  - [ ] Submit button
  - [ ] Previous attempts display

- [ ] Workout History
  - [ ] List past workouts
  - [ ] Show date, exercise, volume, duration
  - [ ] View details button
  - [ ] Filter by routine
  - [ ] Sort by date

- [ ] Personal Records
  - [ ] List PRs by exercise
  - [ ] Show record type (1RM, tonnage, etc)
  - [ ] Show value and date achieved
  - [ ] Link to source workout

---

## Nutrition

- [ ] Nutrition Page
  - [ ] Date selector (calendar)
  - [ ] Show daily totals (calories, macros)
  - [ ] Show targets vs actual
  - [ ] Progress bars for each macro
  - [ ] Remaining calories display

- [ ] Meal Log
  - [ ] List meals (Breakfast, Lunch, Dinner, Snacks)
  - [ ] Add meal button
  - [ ] Show totals for each meal
  - [ ] Delete meal button
  - [ ] Edit meal button

- [ ] Log Meal
  - [ ] Meal category selector
  - [ ] Food search (from food database)
  - [ ] Or manual entry (food name, calories, macros)
  - [ ] Quantity input
  - [ ] Unit selector
  - [ ] Submit button
  - [ ] Recent foods quick select

- [ ] Nutrition History
  - [ ] View previous days
  - [ ] Compare to targets
  - [ ] Show trends

---

## Calendar

- [ ] Calendar Page
  - [ ] Month/week/day view
  - [ ] Annual heatmap (contribution graph style)
  - [ ] Navigate months

- [ ] Day View
  - [ ] Show all events for day
  - [ ] Show scheduled tasks
  - [ ] Show workouts
  - [ ] Show meals
  - [ ] Show habits
  - [ ] Show focus sessions

- [ ] Time Block View
  - [ ] Display hourly schedule
  - [ ] Show blocked time
  - [ ] Add event button
  - [ ] Drag to reschedule (optional)

- [ ] Daily Reflection
  - [ ] Text input for reflection
  - [ ] Energy level (1-10 slider)
  - [ ] Mood score (1-10 slider)
  - [ ] Save button

---

## Analytics

- [ ] Analytics Page
  - [ ] Date range selector
  - [ ] Overall statistics card

- [ ] Mind Vector Analytics
  - [ ] XP earned this period
  - [ ] Tasks completed
  - [ ] Focus sessions logged
  - [ ] Graph: XP over time

- [ ] Muscle Vector Analytics
  - [ ] XP earned this period
  - [ ] Workouts completed
  - [ ] Total tonnage
  - [ ] Graph: Volume over time

- [ ] Money Vector Analytics
  - [ ] XP earned this period
  - [ ] Business actions completed
  - [ ] Graph: Progress over time

- [ ] Consistency Metrics
  - [ ] Habit adherence %
  - [ ] Workout frequency
  - [ ] Days active

- [ ] Data Export
  - [ ] Export as CSV
  - [ ] Export as PDF (optional)

---

## Character Profile

- [ ] Profile Page
  - [ ] Display name
  - [ ] Avatar
  - [ ] Bio
  - [ ] Level and rank
  - [ ] Total XP
  - [ ] Join date

- [ ] Tri-Vector Display
  - [ ] Mind: level/xp/progress bar
  - [ ] Money: level/xp/progress bar
  - [ ] Muscle: level/xp/progress bar

- [ ] Achievements/Badges
  - [ ] Show unlocked achievements
  - [ ] Show achievement details (name, criteria, date unlocked)
  - [ ] Show locked achievements (grayed out)

- [ ] XP Ledger
  - [ ] Show all XP events (paginated)
  - [ ] Show source, vector, amount, date
  - [ ] Filter by vector
  - [ ] Filter by date range

- [ ] Edit Profile
  - [ ] Update display name
  - [ ] Update avatar (upload or URL)
  - [ ] Update bio
  - [ ] Update timezone
  - [ ] Update privacy settings

- [ ] Account Settings
  - [ ] Change email
  - [ ] Change password
  - [ ] Delete account
  - [ ] Logout all devices

---

## Notifications

- [ ] Notifications Page
  - [ ] List unread notifications
  - [ ] Show notification title/body
  - [ ] Show timestamp
  - [ ] Mark as read button
  - [ ] Archive button
  - [ ] Link to source

- [ ] Notification Bell
  - [ ] Show unread count
  - [ ] Dropdown preview
  - [ ] Link to full notifications page

- [ ] Notification Types (backend)
  - [ ] Task completed
  - [ ] Habit check-in reminder
  - [ ] Mission deadline approaching
  - [ ] XP awarded
  - [ ] Achievement unlocked
  - [ ] New level/rank

- [ ] Notification Preferences
  - [ ] Enable/disable by type
  - [ ] In-app only vs push/email (future)
  - [ ] Quiet hours
  - [ ] Save preferences

---

## Admin/Backend Features

These require backend/Edge Functions:

- [ ] XP Awarding System
  - [ ] Award XP on task completion
  - [ ] Award XP on habit check-in
  - [ ] Award XP on workout completion
  - [ ] Create XP ledger entry
  - [ ] Update character/vector progress
  - [ ] Check for level up

- [ ] Level/Rank Calculation
  - [ ] Define XP thresholds per level
  - [ ] Define rank progression
  - [ ] Auto-promote on level up
  - [ ] Show promotion notification

- [ ] Achievement System
  - [ ] Define achievement criteria
  - [ ] Check criteria on events
  - [ ] Unlock achievements
  - [ ] Notify user on unlock

- [ ] Data Validation
  - [ ] Validate all inputs server-side
  - [ ] Prevent duplicate entries
  - [ ] Sanitize user input
  - [ ] Rate limiting

---

## Polish & Quality

- [ ] Responsive Design
  - [ ] Mobile (<640px)
  - [ ] Tablet (640-900px)
  - [ ] Desktop (>900px)
  - [ ] All pages responsive

- [ ] Loading States
  - [ ] Skeleton loaders
  - [ ] Loading spinners
  - [ ] Progress indicators

- [ ] Error Handling
  - [ ] Error messages user-friendly
  - [ ] Retry buttons
  - [ ] Graceful degradation
  - [ ] Network error handling

- [ ] Empty States
  - [ ] "No missions yet" with create button
  - [ ] "No habits yet" with create button
  - [ ] "No data" messages
  - [ ] Helpful next actions

- [ ] Accessibility
  - [ ] WCAG 2.2 AA compliance
  - [ ] Keyboard navigation
  - [ ] Screen reader support
  - [ ] Color contrast 4.5:1
  - [ ] Focus indicators visible

- [ ] Performance
  - [ ] Lazy load images
  - [ ] Optimize bundle size
  - [ ] Cache API responses
  - [ ] Real-time subscriptions efficient
  - [ ] Database queries optimized

- [ ] Design System Compliance
  - [ ] Follow DESIGN_SYSTEM.md
  - [ ] Consistent colors
  - [ ] Consistent typography
  - [ ] Consistent spacing
  - [ ] RPG/console aesthetic maintained

---

## Testing

- [ ] Unit Tests
  - [ ] Utility functions
  - [ ] Type safety checks

- [ ] Integration Tests
  - [ ] Auth flow
  - [ ] Mission CRUD
  - [ ] Workout logging
  - [ ] XP awarding

- [ ] E2E Tests (optional)
  - [ ] Full user journey
  - [ ] Create mission → Complete task → Award XP
  - [ ] Create habit → Check in → Update streak

- [ ] Manual Testing
  - [ ] Test all pages
  - [ ] Test all interactions
  - [ ] Test error scenarios
  - [ ] Test offline mode (if implemented)

---

## Deployment

- [ ] Environment Setup
  - [ ] Production environment variables
  - [ ] Database backup configuration
  - [ ] Monitoring setup
  - [ ] Error tracking (Sentry, etc)

- [ ] Pre-Launch
  - [ ] Security audit
  - [ ] Performance audit
  - [ ] Accessibility audit
  - [ ] Load testing

- [ ] Deploy
  - [ ] Deploy to Vercel
  - [ ] Configure custom domain
  - [ ] Set up SSL certificate
  - [ ] Configure CDN

- [ ] Post-Launch
  - [ ] Monitor for errors
  - [ ] Monitor performance
  - [ ] Gather user feedback
  - [ ] Plan improvements

---

## Post-Launch Features

These can come later:

- [ ] Social Features
  - [ ] Friend/community following
  - [ ] Leaderboards
  - [ ] Social sharing

- [ ] Mobile App
  - [ ] React Native or Flutter
  - [ ] Push notifications
  - [ ] Offline sync

- [ ] Third-Party Integrations
  - [ ] Strava (fitness)
  - [ ] Hevy (workouts)
  - [ ] HealthifyMe (nutrition)
  - [ ] Banks (financial tracking)

- [ ] Advanced Analytics
  - [ ] Predictive models
  - [ ] Goal recommendations
  - [ ] Personalized insights

- [ ] Gamification Enhancements
  - [ ] Daily/weekly challenges
  - [ ] Streaks with multipliers
  - [ ] Team competitions
  - [ ] Seasonal events

---

## Progress Tracking

**Current Status:**
- Phase: Setup ✅
- Completion: 100% Setup | 0% Development

**Next Phase:**
- Foundation (1 week)
- Authentication (2-3 days)
- Core Features (2-3 weeks)
- Polish & Testing (1 week)
- Deployment (1-2 days)

---

## Notes

- Database is production-ready with 24 tables
- 90+ utility functions already implemented
- TypeScript types fully generated
- RLS policies enable secure access
- Ready to build UI/UX

---

## Resources

- **Quick Reference:** `QUICK_REFERENCE.md`
- **Setup Guide:** `NEXTJS_SETUP.md`
- **Database Reference:** `DATABASE_SETUP_COMPLETE.md`
- **Design System:** `DESIGN_SYSTEM.md` (from handoff)
- **Utility Functions:** `src/lib/supabase.ts`
- **Type Definitions:** `src/types/database.ts`

---

Good luck! 🚀
