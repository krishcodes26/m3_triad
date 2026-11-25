# M3 Triad — Information Architecture

## 1. Primary navigation

The `Aside.svg` visibly presents a vertical navigation rail with:

- Dashboard
- Quests / Missions
- Character
- Habits
- Workouts
- Analytics
- Calendar
- Me / State area

Use one canonical naming set in the final product. The current references mix “Quests” and “Missions”; recommended canonical label is **Missions**, with “Quest” available as a gamified synonym in copy. The exact choice is an open product decision.

Nutrition and Notifications are full-page references but their navigation placement is not clearly established. Proposed placement:
- Nutrition: primary destination or a Workout-adjacent “Health” group.
- Notifications: global inbox entry from top bar / bell, not necessarily a permanent primary nav item.

## 2. Page hierarchy

```text
M3 Triad
├── Dashboard
├── Missions
│   ├── Mission overview
│   ├── Mission detail
│   ├── Milestones
│   ├── Task execution
│   └── Action / work log
├── Character (Profile)
│   ├── Identity
│   ├── Tri-vector attributes
│   ├── Levels and ranks
│   ├── Achievements
│   ├── XP ledger
│   └── Privacy and security
├── Habits
│   ├── Today's protocols
│   ├── Habit detail
│   ├── Streak / adherence
│   └── Templates
├── Workouts
│   ├── Workout overview
│   ├── Active session
│   ├── Routine builder
│   ├── Saved routines
│   ├── PR ledger
│   └── Workout history
├── Nutrition
│   ├── Daily summary
│   ├── Meal log
│   ├── Food search / discovery
│   └── Food detail
├── Analytics
│   ├── Executive telemetry
│   ├── Mind
│   ├── Muscle
│   └── Money
├── Calendar
│   ├── Annual activity matrix
│   ├── Day view
│   ├── Time-block planner
│   ├── Daily chronology
│   └── Reflection
└── Notifications
    ├── Inbox
    ├── Archive
    └── Delivery preferences
```

This is a proposed IA inferred from the screen set; not every sub-route is explicitly shown.

## 3. Cross-cutting objects

- Character profile
- Attribute / vector
- XP ledger event
- Mission
- Milestone
- Task
- Habit
- Habit check-in
- Workout routine
- Workout session
- Exercise
- Set record
- Food item
- Meal entry
- Calendar event / scheduled block
- Notification
- Daily reflection
- Achievement / badge

## 4. Navigation rules

- Preserve a stable primary navigation order.
- Keep active state obvious.
- Use breadcrumbs on deep mission/workout subviews if needed.
- Global notifications should be reachable from all pages.
- Quick actions should create the relevant canonical record, not a duplicate.
- Deep links should preserve context (selected date, mission, workout).
- Mobile navigation should expose the highest-frequency destinations first; do not simply shrink the desktop rail.

## 5. Route naming proposal

Use consistent, readable route names, e.g.:

- `/dashboard`
- `/missions`
- `/missions/:missionId`
- `/character`
- `/habits`
- `/workouts`
- `/workouts/session/:sessionId`
- `/nutrition`
- `/analytics`
- `/calendar`
- `/notifications`

This is a proposal, not a requirement to adopt a specific router.
