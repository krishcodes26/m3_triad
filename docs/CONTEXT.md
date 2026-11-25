# M3 Triad — Product Context

## 1. Product summary

M3 Triad is a proposed personal-development operating system that helps a person build and track progress across three foundational life assets:

1. **Mind**
2. **Money**
3. **Muscle**

The product combines planning, execution, tracking, reflection, and gamified progression. It aims to reduce fragmentation between separate productivity, habit, fitness, nutrition, and personal-performance tools.

The experience frames the user as a character in a real-life RPG. Actions performed in the real world can be recorded as evidence of progress, contribute to attribute-specific XP, build consistency, and support level/rank progression.

**Short positioning statement:** One system to plan meaningful goals, execute daily actions, and measure growth across Mind, Money, and Muscle.

## 2. Origin and intent from project conversations

The project conversation describes a desire to combine capabilities commonly spread across apps such as HealthifyMe, Hevy, habit trackers, Strava, and other productivity tools. The intention is not merely to place unrelated trackers on one screen; it is to connect them through a shared progression and gamification layer.

A recurring build-in-public framing is “SMOL DIH, BIG DREAMS”: building an app and attempting to turn it into a startup within a 30-day challenge. This is creator-series context, not necessarily consumer-facing product copy.

The project also introduced a three-part model:

- Mind: intellectual capability, learning, focus, deep work.
- Money: earning, business, career, financial progress.
- Muscle: physical training, fitness, health-related effort.

The product idea is to make progress across these areas trackable and more engaging through goals, deadlines, plans, actions, and success criteria.

A specific formula revealed in the build series is:

**GOAL + DEADLINE + PLAN + ACTION = SUCCESS**

Treat this as a useful planning principle and a possible Mission creation framework. Do not force the formula into every feature.

## 3. Product principles

### 3.1 Unified, not merely aggregated
Features should connect to the same user, timeline, goals, attribute system, and progress ledger. Avoid building isolated mini-apps with inconsistent data.

### 3.2 Action before gamification
Gamification should reinforce meaningful effort. XP is feedback for real actions, not the primary purpose of the product.

### 3.3 Evidence-based progress
A progress event should ideally have a source: completed task, logged workout, recorded meal, habit check-in, focus session, or verified milestone. Distinguish user-entered, imported, and system-calculated data.

### 3.4 User agency and transparency
Users should understand why XP was awarded, how an attribute changed, and what data is stored or imported. Never hide important scoring rules.

### 3.5 Cross-domain balance
The system should help users see whether they are investing in all three vectors. It must not imply that all users need equal numerical progress in every area.

### 3.6 Calm intensity
The interface can feel like a tactical console or RPG command centre, but must remain readable, accessible, and calm enough for daily use.

## 4. What the reference designs establish

The supplied SVGs establish a broad desktop application with a left navigation rail and feature pages. The reference set contains:

| Reference | Primary purpose evidenced by design |
|---|---|
| Dashboard | Personal overview, greeting, attribute/status summary, daily quests, priorities and quick actions |
| Missions | Goals and missions organised into milestones, task execution, progress, action log and work records |
| Workout | Workout planning and logging, exercise sets, progressive overload, routines/templates, PRs and history |
| Nutrition | Daily food log, meals, calorie and macro targets, food discovery/search and nutrient summaries |
| Notifications | Notification inbox, delivery priority, channels, quiet hours, subscriptions and read/archive actions |
| Habits | Repeatable protocols, scheduled habits, streaks, adherence, templates and momentum/protection concepts |
| Profile | Character identity, level, tri-vector attributes, ranks, honours, chronology, XP ledger and privacy/security |
| Analytics | Executive telemetry, attribute distribution, Mind/Muscle/Money analytics and longer-range progress |
| Calendar | Annual activity matrix, day chronology, time-block planner, daily commitments, mission tasks, XP ledger and reflection |
| Aside | Left navigation / brand rail and persistent status area |

The screens repeatedly use RPG language such as character, level, rank, vector, XP, quest, mission, ledger, streak, milestone, and progression.

## 5. What the references do not establish

Do not treat the following as confirmed:

- A final brand name, logo system, or copy style beyond the supplied “LIFE RPG” / M3 Triad direction.
- A production database schema or API contract.
- Actual user accounts, profile details, activity, XP values, health metrics, or financial records shown in the SVGs.
- Confirmed integrations with HealthifyMe, Hevy, Strava, wearable providers, banks, or other third parties.
- A final XP formula, rank thresholds, anti-cheat model, or attribute allocation algorithm.
- Subscription pricing, payment flows, or commercial packaging.
- Exact supported devices or mobile-native behaviour.
- A confirmed technology stack. Some example copy inside the Missions screen mentions PostgreSQL, Supabase, RLS, edge functions, Stripe, and Vitest as task content. This is not sufficient evidence that these are selected technologies.

## 6. Primary user and use cases

The initial product is for people who want to make deliberate progress across multiple areas of life and prefer structured, measurable systems. The user may be a builder, learner, fitness-oriented person, freelancer, founder, or someone building consistency.

Core use cases:

1. Define a meaningful goal and deadline.
2. Break the goal into milestones and actionable tasks.
3. Schedule tasks and repeatable habits.
4. Log workouts, sets, meals, and focus/work sessions.
5. Review progress across the three attributes.
6. Understand streaks, XP, rank, and milestone history.
7. See what happened on a particular day or over a longer period.
8. Reflect, adjust the plan, and continue.

## 7. Product vocabulary

Use vocabulary consistently:

- **Triad / three vectors:** Mind, Money, Muscle.
- **Attribute / vector:** one of the three progress dimensions.
- **Character:** the user's gamified identity and overall progression profile.
- **XP:** experience points; should be attributable to an event and a vector.
- **Level:** progression within a vector or character, as explicitly defined by product rules.
- **Rank / tier:** a named progression band. Do not conflate with level.
- **Mission / Quest:** a meaningful goal or project with deadline, plan, milestones and tasks. The references use both terms; establish a single product taxonomy before final implementation.
- **Task / action:** an executable unit of work.
- **Habit / protocol:** a repeatable behaviour with a schedule and check-in.
- **Session:** a bounded activity such as a workout or focus block.
- **Ledger:** chronological record of XP and progression events.
- **Proof / evidence:** the underlying completion or measurement record.

## 8. Design intent

The visual style is a distinctive hybrid:

- Warm near-white canvas.
- Black / charcoal outlines and strong rectangular card boundaries.
- Compact uppercase labels and editorial display headings.
- Dense, dashboard-like information architecture.
- Bright green, purple, red and occasional warm accents.
- Small technical labels, status chips, progress bars, grids, and compact charts.
- A persistent left-side navigation system.

The visual language should feel like an engineered personal operating system with an approachable RPG layer. Preserve the bold outlines and dense modularity, but improve consistency, responsive behaviour, accessibility, and hierarchy where the source designs are ambiguous.

## 9. Product boundary

M3 Triad is not a medical diagnosis product, investment adviser, or automated financial account manager. Nutrition and workout data should be framed as tracking and personal organisation. Money features should be framed as goals, business execution, and user-entered financial progress unless a separately approved integration is specified.

## 10. Claude operating instruction

When generating UI, code, or product decisions:

1. Prefer explicit facts in this file and the SVG references.
2. Use `DESIGN_SYSTEM.md` for shared visual decisions.
3. Use the relevant `SCREENS/*.md` for page-specific requirements.
4. If something is not evidenced, mark it as a proposal or ask.
5. Do not convert example values or fictional names in the SVGs into defaults for real users.
