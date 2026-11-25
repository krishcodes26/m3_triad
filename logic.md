# M3 Triad --- LIFE RPG Logic Specification

**File:** `logic.md`\
**Scope:** Product logic, progression rules, reward economy, data model,
calculations, event processing, safeguards, and acceptance tests\
**Source of truth:** The ten supplied SVG designs: Dashboard, Aside,
Calendar, Analytics, Habits, Missions, Notifications, Nutrition,
Profile, and Workout.

> **Reading this specification**
>
> -   **Design-confirmed** means the mechanic or wording is visibly
>     represented in the supplied designs.
> -   **Implementation rule** means the recommended backend behaviour
>     needed to make the design reliable.
> -   **Needs product confirmation** means the designs show the concept
>     or sample value but do not fully define its exact formula or edge
>     cases. Do not silently hard-code an assumption.

------------------------------------------------------------------------

# 1. Product model

M3 Triad is a personal operating system presented as a LIFE RPG. It
converts meaningful real-world actions into measurable progress across
three attributes:

  -----------------------------------------------------------------------
  Vector            Attribute         Focus             Examples visible
                                                        in the designs
  ----------------- ----------------- ----------------- -----------------
  Mind              Intellect &       Learning, focus,  Reading pages,
                    cognition         deep work,        focus blocks,
                                      reading,          study sessions,
                                      cognitive         technical work
                                      development       

  Muscle            Hypertrophy &     Training,         Workout sessions,
                    vitality          nutrition,        sets, tonnage,
                                      hydration, sleep, PRs, protein,
                                      physical          hydration, sleep
                                      performance       

  Money             Capital &         Business          Business sprints,
                    sovereignty       execution,        client
                                      revenue, client   milestones,
                                      delivery,         invoices, revenue
                                      financial action  goals
  -----------------------------------------------------------------------

The three vectors contribute to the user's overall character
progression. The system is explicitly designed to prevent one vector
from dominating the character:

-   Each vector has its own XP, level, telemetry, recent actions, and
    milestones.
-   The character has an overall level, rank, lifetime XP, and
    progression bar.
-   Tri-vector equilibrium / harmony measures balance between Mind,
    Muscle, and Money.
-   Rank promotions require vector stability, not only a large total XP
    number.
-   Badges and titles recognize accomplishments in a particular vector
    or across all three.
-   Quests and missions turn long-term goals into plans, milestones, and
    executable tasks.
-   Habits represent repeatable protocols and non-negotiables.
-   The XP ledger records why progress was earned and is intended to be
    immutable.

**Core principle:** Reward the user for doing meaningful work in life,
not for spending time inside the app.

------------------------------------------------------------------------

# 2. Navigation and system boundaries

The supplied Aside design establishes these main destinations:

-   Dashboard
-   Quests
-   Character
-   Missions
-   Habits
-   Workouts
-   Analytics
-   Calendar

The supplied screens add supporting systems:

-   Nutrition & Fuel Matrix
-   Notifications
-   Profile / Character & Identity Matrix
-   XP Ledger
-   Daily Command Center
-   Focus Session
-   Daily snapshots
-   Boss / enemy encounters
-   Badges, titles, rank ladder, and progression history

Do not merge all of these into one generic tracker. They feed a shared
progression engine, but each domain owns its own source records and
validation rules.

## 2.1 Domain ownership

  -----------------------------------------------------------------------
  Domain                  Owns                    Emits progression
                                                  events
  ----------------------- ----------------------- -----------------------
  Habits                  Protocol definitions,   Protocol completed,
                          schedules, completions, cadence milestone,
                          streaks, adherence      consistency milestone

  Nutrition               Food logs, meals, macro Protein target reached,
                          targets, hydration,     hydration benchmark
                          protein target          reached

  Workouts                Routines, sessions,     Workout completed, PR
                          exercises, sets, reps,  achieved, volume
                          load, tonnage, PRs      milestone

  Focus / Mind            Focus sessions, reading Focus block completed,
                          logs, study/work        reading target reached
                          records                 

  Money                   Business actions,       Verified business
                          client delivery,        action, revenue
                          revenue and financial   milestone, client
                          milestones              delivery

  Quests                  Daily quests,           Quest objective
                          challenges, boss        completed, boss
                          encounters              defeated

  Missions                Strategic goal, plans,  Task completed,
                          milestones, tactical    milestone verified,
                          tasks, work records     mission completed

  Character               Aggregate XP, vector    Level-up, rank-up,
                          levels, overall level,  balance milestone
                          rank, balance, titles   

  Analytics               Read-only aggregation   No XP directly
                          and trends              

  Calendar                Activity timeline,      No XP directly
                          daily summaries, audit  
                          views                   

  Notifications           Durable delivery and    No XP directly
                          read state              
  -----------------------------------------------------------------------

Analytics, Calendar, Character, and Notifications must not independently
create duplicate XP awards. They display or summarize authoritative
events.

------------------------------------------------------------------------

# 3. Progression vocabulary

The designs use several progression concepts. Keep their meanings
separate.

  -----------------------------------------------------------------------
  Concept                 Meaning                 Scope
  ----------------------- ----------------------- -----------------------
  Vector XP               XP attributed to Mind,  One vector
                          Muscle, or Money        

  Lifetime XP             Sum of credited XP      Character
                          across the three        
                          vectors                 

  Vector level            Level of an individual  Mind / Muscle / Money
                          attribute               

  Character level         Overall RPG level       Character

  Rank / tier             Named standing in the   Character
                          official rank ladder    

  Tier XP progress        Progress within the     Vector or character
                          current level's XP      
                          interval                

  Harmony / equilibrium   Measure of balance      Character
                          across the three        
                          vectors                 

  Badge                   Permanent achievement   Vector or cross-vector
                          for a defined condition 

  Title                   Identity label unlocked Character
                          through achievements or 
                          progression             

  Perk                    A gameplay benefit      Character / vector
                          unlocked by an          
                          achievement or rank     

  Streak                  Consecutive qualifying  Habit / character
                          days or protocol        
                          completions             

  Quest                   Shorter, bounded        Daily or challenge
                          objective               

  Mission                 Long-term goal with     Strategic
                          plans, milestones, and  
                          tasks                   

  Boss / enemy            A named                 Quest / habit
                          obstacle/challenge with 
                          progress or             
                          counter-strategy        

  XP ledger               Immutable record of     Audit
                          credited XP and         
                          corrections             
  -----------------------------------------------------------------------

**Important:** A vector level is not the same thing as the overall
character level. A character can be Level 24 while Mind is Level 26,
Muscle Level 22, and Money Level 21, as shown in the Profile design.

------------------------------------------------------------------------

# 4. XP architecture

## 4.1 Three independent XP wallets, one character total

Maintain separate XP balances for:

-   `mind_xp`
-   `muscle_xp`
-   `money_xp`

The character's lifetime XP is:

``` text
lifetime_xp = mind_xp + muscle_xp + money_xp
```

The supplied Profile design displays Mind lifetime XP, Muscle lifetime
XP, Money lifetime XP, and a lifetime accumulated XP total. Its sample
values are consistent with the total being the sum of the three vectors.

Every XP award must be assigned to exactly one vector unless a specific
cross-vector reward is explicitly configured. Cross-vector rewards
should be split into separate vector ledger entries so the attribution
remains auditable.

Do not create an unclassified XP award. Every entry must have a vector.

## 4.2 XP is earned from validated work

The designs show XP being awarded for actions such as:

### Mind examples

-   Read 10 pages: `+20 Mind XP` in the Dashboard daily quest example.
-   Deep Work 2 Hours: `+40 Mind XP` in the Dashboard example.
-   Reading session (Atomic Habits): `+20 Mind XP` in the recent XP
    ledger example.
-   Deep work sprint (Coding): `+30 Mind XP` in the recent XP ledger
    example.
-   Focus / reading / study tasks can also contribute to Mind-specific
    badges and milestones.

### Muscle examples

-   Sleep target 7--7.5 hours: `+25 Muscle XP` in the Dashboard example.
-   Hydration benchmark: `+20 Muscle XP` in the Habits example.
-   Nutrition screen shows `+40 Muscle XP` once per 24-hour cycle on
    reaching the customized, verified protein target.
-   Planned workout quest: `+50 XP` in the Dashboard example.
-   Workout sessions award Muscle XP based on configured session/reward
    rules. The Workout screen displays an example `+120 XP` reputation
    yield for the current session.
-   PRs and volume milestones can trigger additional Muscle rewards.

### Money examples

-   Daily Money Action: `+30 Money XP` in the Dashboard example.
-   Verified client milestone: `+60 Money XP` in the Calendar example.
-   A shipped mission milestone displays `+120 Money XP` in the Profile
    ledger.
-   Revenue and client delivery milestones may unlock Money badges.

These values are examples visible in the designs, not a complete final
reward table. The same type of activity may have different configured
values depending on its quest, protocol, task, difficulty, or milestone.
Store reward values in configuration, not hard-coded in UI components.

## 4.3 Reward rule structure

Every reward rule should define:

  -----------------------------------------------------------------------
  Property                            Purpose
  ----------------------------------- -----------------------------------
  `rule_key`                          Stable unique rule name

  `source_type`                       Habit, nutrition, workout, focus,
                                      quest, mission, etc.

  `vector`                            Mind, Muscle, or Money

  `base_xp`                           XP amount

  `bonus_xp`                          Optional milestone bonus

  `eligibility`                       What must be true before the reward
                                      is earned

  `cap_scope`                         Per event, day, week, exercise,
                                      mission, etc.

  `verification_level`                Self-reported, app-validated,
                                      integration-verified,
                                      admin/system-verified

  `cooldown`                          Optional minimum time between
                                      awards

  `active_from` / `active_to`         Rule validity

  `config_version`                    Rule version for auditability
  -----------------------------------------------------------------------

## 4.4 XP eligibility pipeline

An action awards XP only after the backend confirms all of the
following:

1.  The authenticated user owns the source record.
2.  The source record is valid and complete.
3.  The action meets the configured reward condition.
4.  The event is not a duplicate.
5.  The action has not already received the same reward.
6.  The reward cap / cooldown permits the award.
7.  The vector is defined by the rule.
8.  The event is within the permitted date/time window.
9.  The verification requirement is satisfied.

The client may request an action or submit a source record. It must
never decide the XP amount, vector, level, rank, or badge unlock.

## 4.5 XP event identity and idempotency

Use a stable event key, for example:

``` text
habit_completion:{completion_id}
nutrition_protein_target:{user_id}:{local_date}
workout_completion:{workout_session_id}
workout_pr:{exercise_id}:{pr_record_id}
mission_task:{task_id}:completed
mission_milestone:{milestone_id}:verified
focus_session:{session_id}:completed
```

The same event key must never award the same reward twice. Retried
network requests return the original result.

## 4.6 Caps and anti-farming

The designs explicitly show anti-farming safeguards, including the
Nutrition screen's once-per-24-hour verified protein reward and the
Profile's non-destructive anti-shame rule.

Implement configurable caps at the reward-rule level:

-   One protein-target reward per configured nutrition cycle.
-   One completion reward per habit occurrence.
-   One completion reward per workout session.
-   PR rewards only for a verified improvement over a comparable prior
    record.
-   Mission task rewards only once per task completion.
-   Milestone rewards only once per verified milestone.
-   Focus rewards must use a completed session and defined focus
    criteria, not app-open duration.
-   Repeated tiny entries, arbitrary calorie spikes, duplicate taps, and
    fabricated client XP must not create rewards.

Do not stop users from recording valid activity when a cap is reached.
Only the additional XP reward is capped.

## 4.7 XP corrections

The Profile design describes an immutable XP ledger and says missed days
or broken streaks never delete lifetime XP, reverse earned levels, or
strip unlocked badges.

Therefore:

-   Never delete a ledger row.
-   Never silently edit a credited amount.
-   If an award was invalid, create an audited correction / reversal
    entry referencing the original.
-   Preserve the original event and correction history.
-   Do not reverse a legitimate earned badge or level because a streak
    later breaks.
-   Do not subtract XP for a missed habit, missed quest, or broken
    streak.

------------------------------------------------------------------------

# 5. Vector levels

## 5.1 Each vector levels independently

The Character screen shows three separate attribute cards:

-   Mind --- Intellect & Cognition
-   Muscle --- Hypertrophy & Vitality
-   Money --- Capital & Sovereignty

Each card displays: - Current vector level. - Current tier XP / XP
required. - Lifetime XP. - XP earned today. - Core metrics logged. -
Recent action.

The sample Profile shows Mind Level 26, Muscle Level 23, and Money Level
21, with different current-tier XP values. The exact XP curve is not
fully specified by the screenshots.

## 5.2 Vector level calculation

Use a configurable threshold table per vector or a shared configurable
curve:

``` text
vector_level = highest level whose cumulative threshold <= vector_lifetime_xp
```

For each vector:

``` text
tier_xp = vector_lifetime_xp - threshold_for_current_level
tier_xp_required = threshold_for_next_level - threshold_for_current_level
tier_progress = tier_xp / tier_xp_required
```

The UI can display this as `840 / 1,000 XP`, as in the Profile design.

**Needs product confirmation:** The designs show examples of
`840 / 1,000`, `620 / 1,000`, and `490 / 1,000`, but do not establish
whether every level always requires 1,000 XP or whether the values are
sample values from a configurable curve. Do not assume a universal
1,000-XP threshold until confirmed.

## 5.3 Vector-specific progression

A vector level-up should: 1. Recalculate that vector's level from its XP
ledger. 2. Update the vector progression summary. 3. Create a
vector-level-up event. 4. Trigger an appropriate notification /
celebration. 5. Evaluate vector-specific badges, titles, and perks. 6.
Recalculate overall harmony and rank eligibility.

A vector level-up does not automatically mean the character's overall
level or rank has increased.

------------------------------------------------------------------------

# 6. Overall character level

## 6.1 Character level is separate from vector levels

The Dashboard and Profile show an overall character level alongside
three individual vector levels.

Character level is derived from overall lifetime XP using a configurable
character-level threshold table:

``` text
character_level = highest level whose total_xp_threshold <= lifetime_xp
```

The overall level progress display uses:

``` text
character_tier_xp = lifetime_xp - character_threshold(current_level)
character_tier_required = character_threshold(next_level) - character_threshold(current_level)
character_progress = character_tier_xp / character_tier_required
```

The supplied screens show example progress such as `2,450 / 3,000`, and
a separate dashboard example of `3,450 / 5,000` or `3,450 / 5,600`
depending on the displayed state. These are UI sample states, not enough
evidence to infer the exact cumulative level curve.

## 6.2 Character level and lifetime XP

Do not confuse: - lifetime XP (cumulative all-time total), - XP earned
in the selected analytics period, - XP inside the current level
interval, - XP earned today, - vector-specific tier XP.

These must be separate fields and clearly labeled in the UI.

## 6.3 Level-up processing

When an award crosses one or more character thresholds: 1. Recalculate
the level from the ledger-derived lifetime XP. 2. Record every crossed
level milestone. 3. Update the cached character summary. 4. Evaluate
rank requirements. 5. Evaluate level-based badges, titles, and perks. 6.
Send one consolidated level-up notification.

Do not award XP simply because a level-up occurred.

------------------------------------------------------------------------

# 7. Tri-vector harmony / equilibrium

## 7.1 Purpose

The Profile and Analytics designs explicitly describe a Tri-Vector
Equilibrium / Harmony score. It exists to prevent stat skewing and
encourage development across Mind, Muscle, and Money.

The Profile copy states that the LIFE RPG algorithm calibrates
advancement through Mind, Muscle, and Money parity, and that neglecting
a vector throttles progression.

The visible formula is:

``` text
Min(Mind, Muscle, Money) × 0.4 + Average(Mind, Muscle, Money) × 0.6
```

## 7.2 Safe implementation of the visible formula

The inputs must be normalized to a common scale before applying the
formula. Do not directly combine raw lifetime XP values because XP
totals can have different magnitudes and would not produce a percentage.

Recommended implementation:

1.  Calculate a normalized vector score for Mind, Muscle, and Money on a
    0--100 scale.
2.  Let `min_score` be the lowest of the three normalized scores.
3.  Let `avg_score` be their arithmetic mean.
4.  Calculate:

``` text
harmony_score = (min_score × 0.4) + (avg_score × 0.6)
```

5.  Clamp the displayed result to 0--100%.

**Needs product confirmation:** The screenshots expose the formula's
shape but do not define the normalization function that converts each
vector's level / progress / activity into a 0--100 score. Product must
approve that normalization before production. The UI examples of 92% and
78.4% should be treated as sample values, not reverse-engineered into an
assumed formula.

## 7.3 Harmony effects

Design-confirmed effects: - Harmony is displayed on the character
profile and analytics. - The system uses balance to throttle or
calibrate advancement. - Rank promotions require absolute vector
stability. - The Consistent Striker badge is cross-vector and requires
daily routine habits across all three pillars for 14 straight days. - An
Equilibrium Perk is shown as a reward for this cross-vector achievement.

Implementation rule: - Harmony should be a progression gate / modifier,
not a reason to delete XP. - A low score may delay rank eligibility or
reduce eligibility for selected balance-based bonuses. - It must not
erase earned vector XP or retroactively lower levels. - Display what
vector is lagging and what action can improve balance.

------------------------------------------------------------------------

# 8. Rank and tier ladder

## 8.1 Official ladder visible in Profile

The Profile design shows eight ranks:

  Rank letter   Rank name       Character level range shown
  ------------- ------------- -----------------------------
  E             Novice               Unlocked starting tier
  D             Apprentice        Unlocked progression tier
  C             Warrior                              20--29
  B             Elite                                30--44
  A             Master                               45--59
  S             Grandmaster                          60--74
  SS            Legend                               75--89
  SSS           Mythic                                  90+

The current example profile is Rank C --- Warrior, Level 24. The rank
card describes Warrior as the active state.

## 8.2 Rank promotion is not level-only

The Profile design states: - Ranks dictate character standing. - Ranks
unlock equipment slots, titles, and guild authority. - Tier promotions
require absolute vector stability. - The next rank example is Rank B ---
Elite, requiring Level 30 and 65,000 lifetime XP. - The Elite preview
also references Mind / Muscle / Money all being above Level 25.

Therefore rank eligibility should be evaluated as a set of conditions,
not just `character_level >= min_level`.

For the displayed Rank B example, the confirmed visible requirements
are:

-   Character Level 30.
-   Lifetime XP 65,000.
-   Mind, Muscle, and Money each above Level 25 (the exact
    inclusive/exclusive boundary should be confirmed).

The screenshots do not fully define the promotion requirements for every
other rank. Do not invent them. Store each rank's requirements in
configuration and leave unconfirmed ranks as draft rules until product
approval.

## 8.3 Rank promotion algorithm

``` text
eligible = true

check character level requirement
check lifetime XP requirement
check each required vector level
check minimum harmony / equilibrium requirement
check any required badge / milestone
check any other rank-specific condition

if every configured condition passes:
    mark rank eligible
    allow promotion according to product flow
else:
    show unmet requirements
```

Rank promotion should be a durable event. The user should see: - Current
rank. - Next rank. - Required level and lifetime XP. - Required vector
levels. - Harmony / stability requirement. - Any required badge or
milestone. - Rewards unlocked by the promotion.

## 8.4 Rank rewards

Design-confirmed rank reward categories: - Equipment slots. - Titles. -
Guild authority.

Do not award direct XP for a rank promotion unless an explicit reward
rule is configured. Rank rewards should not create a self-feeding XP
loop.

------------------------------------------------------------------------

# 9. Badges, honors, titles, and perks

These are related but distinct.

## 9.1 Badges

A badge is an achievement with a clear, verifiable unlock condition. The
Profile shows: - 32 total badges. - 14 unlocked in the sample state. -
Category filters: All, Mind, Muscle, Money, Locked. - Badge reward XP. -
Unlock date. - Badge tier (where applicable). - Progress toward locked
badges.

The sample data is illustrative and should not be treated as the final
total badge catalogue.

## 9.2 Badge examples shown in the designs

  --------------------------------------------------------------------------
  Badge            Vector / type    Visible condition       Displayed reward
  ---------------- ---------------- ------------------ ---------------------
  Deep Work Monk   Mind Tier II     Log 100 unbroken                 +100 XP
                                    hours of deep      
                                    distraction-free   
                                    work blocks        

  Century Press    Muscle Tier II   Validated 100 kg+                +150 XP
                                    flat barbell bench 
                                    press with strict  
                                    form               

  First Rev Sprint Money Tier I     Invoice and                      +200 XP
                                    complete a client  
                                    delivery milestone 
                                    exceeding \$3,000  
                                    USD                

  Consistent       Equilibrium /    Maintain unbroken                +100 XP
  Striker          cross-vector     daily routine      
                                    habits across all  
                                    3 pillars for 14   
                                    straight days      

  Iron Pillar      Muscle           Log 100 total                    +250 XP
                                    high-intensity     
                                    strength training  
                                    sessions; sample   
                                    progress 82 / 100  

  Grand Architect  Mind / mission   Successfully ship                +500 XP
                   achievement      3 major production 
                                    software           
                                    architectures;     
                                    sample progress 1  
                                    / 3                
  --------------------------------------------------------------------------

Badge reward values shown in the cards should be credited through the XP
ledger using the badge's configured vector. For cross-vector badges,
define the target vector or split rule explicitly.

## 9.3 Badge evaluation

Badge definitions should be data-driven:

``` text
badge:
  code
  name
  description
  vector
  tier
  criteria_type
  criteria_config
  reward_xp
  reward_vector
  title_unlock_id (optional)
  perk_unlock_id (optional)
  is_hidden
  is_active
```

When a relevant event occurs: 1. Update authoritative counters /
records. 2. Evaluate relevant badge conditions. 3. Insert the badge only
if the condition is newly satisfied. 4. Enforce uniqueness on
`(user_id, badge_id)`. 5. Award configured badge XP once. 6. Unlock any
attached title or perk. 7. Create a durable notification. 8. Record the
unlock in the character milestone chronology.

## 9.4 Titles

Titles are identity labels that can be unlocked and equipped. The
Profile shows an equipped title selector and an unlocked titles vault,
with examples: - The Disciplined Architect - Focus Practitioner -
Hypertrophy Adept

A title should have: - Unique code. - Display name. - Unlock criteria. -
Optional source badge / rank. - Equip status. - Unlock timestamp.

A title is cosmetic / identity progression unless a separate perk is
explicitly attached. Do not confuse a title with a rank.

## 9.5 Perks

The designs show an Equilibrium Perk and refer to new perk cards /
passive buffs in progression messaging. Perks are benefits attached to a
badge, rank, or milestone.

Every perk must specify: - Exact effect. - Scope. - Start and end
conditions. - Whether it is passive or manually activated. - Whether it
can stack. - Whether it affects XP or only UI / access. - Audit and
abuse rules.

Do not invent gameplay effects from the visual label alone. Implement
only perks whose effects are approved.

------------------------------------------------------------------------

# 10. Habits: protocols, cadence, streaks, and adherence

## 10.1 Habits are called protocols in the design

The Habits screen describes protocols as repeatable behaviours across
Mind, Muscle, and Money. It shows: - Today's cadence. - Streak
momentum. - Seven-day rolling grade. - Today's XP yield. - Today's
scheduled protocols. - Protocol-specific target, progress, current
streak, and best streak. - Lifetime hits and 30-day rate. - Quick deploy
templates. - Attribute integrity / adherence by vector. - Linked enemy /
counter-strategy concepts.

A habit should be assigned to one vector.

## 10.2 Protocol structure

Each protocol should have: - Name and description. - Vector. - Schedule
/ cadence. - Target and unit. - Completion type: binary, numeric
threshold, duration, count, or externally synced. - Reward rule. -
Optional linked quest / mission. - Optional enemy / counter-strategy. -
Active / paused / archived state. - Effective dates for schedule
changes.

Examples visible in the Habits design: - Read 10 Pages --- Mind. - Deep
Work Focus Block --- Mind. - Complete Planned Workout --- Muscle. -
Hydration Benchmark --- Muscle. - Sleep Target (7h 30m+) --- Muscle /
recovery. - High-Leverage Business Action --- Money. - Daily Revenue
Action --- Money. - Recreational Screen Time under 180 minutes ---
personal protocol. - System Architecture Study --- Money or Mind as
configured by the product; the example labels it Money in the mock-up.

## 10.3 Completion and reward

A protocol completion awards its configured XP only when the target is
satisfied and the completion is accepted by the backend.

For numeric protocols: - Store the raw value and unit. - Store the
target snapshot used for evaluation. - Store the local activity date. -
Calculate completion server-side. - Do not award repeatedly as a user
updates the number from 50% to 80% to 100%.

For a binary protocol: - One completion per scheduled occurrence unless
the protocol explicitly allows multiple.

## 10.4 Missed days and streak policy

The designs explicitly state: - Missed protocols incur zero XP
penalties. - Missed days or broken streaks never delete lifetime XP. -
Missed days pause momentum but never reduce permanent progression. - The
app should avoid shame / punitive progression.

Implementation: - A missed protocol earns zero completion XP. - Never
subtract XP. - Never remove badges or levels. - Preserve the best
streak. - Current streak / momentum can pause, reset, or resume
according to the protocol's schedule, but the exact behaviour must be
shown clearly. - Unscheduled days do not count as misses. - Paused or
archived protocols do not accrue missed-day penalties. - Do not convert
an unlogged day into a confirmed miss if the user has not yet completed
the day or sync is pending.

**Needs product confirmation:** Dashboard copy says missed days "pause
momentum" and Habits copy says missed protocols never reset progression.
Define whether a current streak is paused, broken, or grace-protected.
The immutable progression rule is clear: no lifetime XP loss, no level
rollback, no badge removal.

## 10.5 Streak metrics

Keep separate: - Current protocol streak. - Best protocol streak. -
Character / cross-vector consistency streak. - Seven-day rolling
adherence. - Thirty-day consistency rate. - Lifetime protocol hits.

Do not collapse these into one ambiguous "streak" number.

## 10.6 Cross-vector consistency

The Consistent Striker badge requires daily routine habits across all
three pillars for 14 consecutive days.

Define a qualifying day as: - At least one eligible Mind protocol
completed. - At least one eligible Muscle protocol completed. - At least
one eligible Money protocol completed.

The exact daily minimum should be configurable. The cross-vector day is
only complete when all three required vector conditions are met.

------------------------------------------------------------------------

# 11. Nutrition and Muscle progression

## 11.1 Nutrition is a Muscle vector input

The Nutrition screen calls itself the Nutrition & Fuel Matrix and
shows: - Calories / energy. - Protein. - Carbohydrates. - Fats. -
Dietary fibre. - Hydration. - Electrolytes. - Meals and food logs. -
Verified / estimated food sources. - Regional foods and unit
conversion. - Macro targets. - RPG ledger integrity.

Nutrition activity can support Muscle progression, but food logging
itself should not be a farming mechanism.

## 11.2 Protein reward rule

The Nutrition design explicitly states:

-   A verified protein target is customized by the user.
-   Hitting it awards `+40 Muscle XP`.
-   It is credited precisely once per 24-hour cycle.
-   Micro-entries or arbitrary calorie spikes generate zero exploit XP.

Implement: 1. Store a target snapshot for the nutrition day / cycle. 2.
Calculate total protein from accepted food entries. 3. Apply source
confidence / verification requirements. 4. Detect the first valid
crossing of the target. 5. Award the configured Muscle XP once for that
cycle. 6. Record the event key and target snapshot. 7. Ignore later
updates for additional XP.

The UI should show the credited status and the exact target used.

## 11.3 Other nutrition metrics

Calories, carbs, fats, fibre, hydration, and electrolytes are useful
telemetry. They do not automatically award XP unless a specific protocol
/ quest rule says so.

Hydration is separately shown as a Muscle protocol with an example
`+20 Muscle XP`. Do not award both the hydration protocol reward and a
second duplicate nutrition reward for the same completion unless the
rules explicitly define two distinct objectives.

------------------------------------------------------------------------

# 12. Workouts and Muscle progression

## 12.1 Workout data

The Workout screen establishes a detailed training workflow: - Create
routine / start empty workout / start from routine. - Exercise
library. - Training sessions. - Sets, reps, weight, RPE, notes, and
status. - Rest timer and elapsed time. - Session tonnage. - Exercise
substitution. - Progressive overload comparison. - Save as template /
discard session. - Saved routines and templates. - Volume / recovery
targets. - Hall of Fame / PRs. - Workout history and PR ledger. - Linked
guild mission.

## 12.2 Workout XP

A completed workout can award Muscle XP based on configured rules.

The UI shows an example current-session reputation yield of `+120 XP`,
and historical sessions with different XP rewards. These are examples,
not a universal fixed amount.

The backend should evaluate: - Session is saved and completed. - At
least one valid exercise / set exists according to the configured
minimum. - Set data is valid. - Session is not a duplicate. - User owns
the session. - Daily / weekly reward caps are respected.

Do not award XP for starting a workout, opening an exercise, or
repeatedly saving the same session.

## 12.3 PR logic

A PR must compare like-for-like records: - Same exercise identity or
approved equivalent. - Same measurement type. - Same unit. - Valid load
/ reps / form conditions where relevant. - Exclude warm-up / invalid /
incomplete sets if the PR rule requires it.

The design shows: - PR alerts during the session. - Previous best. - New
record. - Estimated 1RM. - Hall of Fame all-time bests. - A +2.5 kg
progressive leap example.

A PR can trigger: - A PR event. - A Muscle XP bonus if configured. - A
badge evaluation. - A Hall of Fame update. - A notification.

Prevent farming by not rewarding repeated re-entry of the same PR,
invalid unit changes, or trivial edits to a historical set.

## 12.4 Tonnage and volume

Session tonnage can be calculated from valid completed sets:

``` text
set_tonnage = load × reps
session_tonnage = sum(set_tonnage for eligible sets)
```

Define unit conversions consistently. Tonnage and volume are analytics
and progression evidence; they should not automatically generate
unlimited XP per kilogram.

------------------------------------------------------------------------

# 13. Mind progression: focus, reading, and cognitive work

The Dashboard, Habits, Calendar, and Analytics screens show Mind
activity such as: - Reading pages. - Focus blocks. - Deep work
sessions. - Technical study. - Coding / architecture work. - Focus
duration. - Reading velocity. - Screen-time protocols. - Completed focus
sprints.

## 13.1 Focus session

A focus session should store: - Planned duration. - Actual focused
duration. - Start / end time. - Paused duration. - Focus preset
(e.g. Pomodoro). - Linked priority task / mission. - Completion
status. - Vector. - XP reward rule.

Award XP only after a valid completion threshold. Do not award based
solely on an open timer or background app time.

The Dashboard shows a focus-session example with: - 25:00 Pomodoro. - 50
/ 10 Ultra. - Custom option. - A linked priority task. - Daily deep-work
progress such as 45m / 120m.

## 13.2 Reading

A reading log should store: - Book / resource. - Pages read. - Current
page / total pages. - Session date. - Optional notes. - Vector
assignment. - Reward event.

A reading target (e.g. 10 pages) is rewarded once per scheduled
occurrence / quest. Logging 20 pages should not create multiple
identical daily target rewards unless the rule explicitly rewards
incremental milestones.

## 13.3 Mind telemetry

Analytics can display: - Reading velocity (daily average pages). - Focus
hours. - Focus blocks. - Habit adherence. - Current learning resource
and completion percentage.

Analytics metrics are not independent XP events.

------------------------------------------------------------------------

# 14. Money progression

Money represents capital and sovereignty, with examples in the
screens: - Business actions. - Revenue actions. - Client delivery. -
Invoicing. - SaaS / business tracks. - Business sprints. - MRR
milestones. - Financial / budget review.

## 14.1 Money action

A Money protocol or daily quest should define: - Action. - Target
outcome. - Proof type. - Completion criteria. - Reward. - Optional
linked mission / revenue goal.

Examples shown: - Review client contract: `+30 Money XP`. - Verified
client milestone: `+60 Money XP`. - Shipped backend mission milestone:
`+120 Money XP`. - First Rev Sprint badge for invoiced and completed
client delivery exceeding \$3,000 USD.

## 14.2 Verification levels

Money rewards can be self-reported or supported by evidence. Define the
required proof level per action: - Self-reported completion. - Uploaded
proof / note. - Linked invoice or client deliverable. - Verified
milestone approval.

The Mission screen uses system-verified work records and attached
evidence examples. Use that pattern for high-value Money milestones.

Do not assume that entering a revenue number proves revenue was earned.
A revenue milestone should have an explicit verification policy.

------------------------------------------------------------------------

# 15. Quests and daily command center

## 15.1 Daily quests

The Dashboard shows a daily quest list with: - Completed count (e.g. 3
of 7). - XP gained today from quests. - Vector label. - Target. -
Current logged progress. - Reward amount. - State: done, scheduled,
start, on track, pending. - "View all" route to habits / commitments.

Examples shown: - Sleep 7--7.5 hours --- Muscle --- +25 XP. - Read 10
pages --- Mind --- +20 XP. - Hydration 2.5 / 3.0 L --- Muscle --- +15
XP, 500 ml remaining. - Planned gym session --- Muscle --- +50 XP. -
Deep Work 2 Hours --- Mind --- +40 XP. - Screen Time Under 3 Hours ---
Mind --- +20 XP. - Daily Money Action --- Money --- +30 XP.

These examples are not necessarily a fixed daily template for every
user. Daily quests should be generated from the user's enabled
protocols, active missions, schedule, and configured challenges.

## 15.2 Quest states

Recommended states: - `available` - `scheduled` - `in_progress` -
`completed` - `expired` - `skipped` (optional, non-punitive)

The state transition must be server-validated. A quest is complete only
when its completion criteria are satisfied.

## 15.3 Daily boss encounter

The Dashboard shows an active boss battle: - Enemy: Procrastination
Specter. - Challenge: 7-Day Focus Sprint. - Day count (e.g. Day 4 of
7). - Boss HP / remaining progress. - Reward: +200 Mind XP and an
"Unbroken" badge. - "Log today's sprint" action.

Implement a boss as a named challenge with: - Start / end. - Daily
objective. - Progress counter or HP. - Failure / pause behaviour. -
Reward and badge. - Event history.

**Needs product confirmation:** The screenshots show the enemy name,
remaining HP, day count, and reward but do not define the exact HP
damage formula or what happens after a missed day. Do not invent
punitive penalties. Keep the challenge non-destructive and define the
exact rules before implementation.

------------------------------------------------------------------------

# 16. Enemies, defenses, and counter-strategies

The Habits and Notifications screens show: - Procrastination Specter /
Hydra. - Enemy or defense tracking. - Counter-action such as a 5-minute
focus rule. - Intercepted impulses. - Counter-strategy such as bedside
Kindle only / grayscale toggle. - Streak protection. - A "no guilt, no
penalty counter" style of guidance. - Zero-shame safeguards.

Model an enemy as a user-defined obstacle / challenge, not as a
diagnosis or inferred personal trait.

An enemy record may include: - Name. - Category. - Trigger / context. -
Counter-strategy. - Active schedule. - Encounter events. - Optional boss
/ quest link. - Privacy level.

A defense event records: - Trigger detected or user-reported. -
Counter-strategy used. - Outcome. - Timestamp. - Optional evidence /
note.

A successful counter-action may progress a quest or badge if configured.
It should not generate XP simply because the app inferred that the user
was distracted.

------------------------------------------------------------------------

# 17. Missions: long-term goals, plans, milestones, and tasks

## 17.1 Mission hierarchy

The Missions screen establishes this structure:

``` text
Mission
  ├── Success criteria / Definition of Done
  ├── Plans / Phases
  │     ├── Milestones
  │     ├── Dependencies
  │     └── Tactical tasks
  ├── Task execution log
  ├── Action / work records
  ├── Mission attribute yield
  └── Mission activity history
```

A mission is a strategic outcome, not a simple to-do item.

Examples shown: - Build Olywood --- 42% overall. - Sub-3:45 Marathon ---
68%. - Reach \$10K MRR SaaS --- 25%.

Mission cards show: - Vector / category. - Status: on track, at risk,
completed. - Overall progress. - Plans complete. - Deadline. - Next
telemetry / health.

## 17.2 Definition of Done

Every mission must have a written success criterion. Example shown:

"A fully operational application is deployed to production and actively
used by intended beta cohorts, supported by automated Stripe billing
tiers, Supabase JWT authentication, and sub-100ms API response rates."

Mission completion should be based on this definition, not merely all
tasks being checked off.

## 17.3 Plans and milestones

A plan is a phase of a mission. The design shows: - Discovery. -
Prototyping. - Backend Development. - Frontend Development. - Testing &
Public Launch.

Each plan has: - Task count. - Weighted progress. - Due date. -
Status. - Dependencies. - Completion criteria.

A milestone can be verified and unlock dependent plans. The screen
explicitly shows dependency unlocking after Plan 02 is complete and
verified.

## 17.4 Weighted mission progress

The Mission screen shows weighted progress, such as
`42% (24 / 52 Tasks)`, and plan-level completion. It also shows weighted
task progress in plan summaries.

Implement progress using configured task weights:

``` text
plan_progress =
  sum(weight of completed / verified tasks) / sum(weight of all tasks)

mission_progress =
  sum(weight of completed / verified plans or tasks) / total configured weight
```

Choose one canonical calculation model (plan-weighted or task-weighted)
and use it consistently across mission cards, plan cards, and analytics.
Do not mix raw task count with weighted progress in the same percentage.

## 17.5 Tactical task XP

The screen shows Mind XP potential for mission tasks and work records,
for example: - Define database schema & ORM migrations --- queued
reward. - Configure RLS policies --- queued reward. - Build integration
test suite --- queued reward. - Work records verified by system.

A task reward should: 1. Be assigned to a vector. 2. Have a configured
XP reward. 3. Be awarded once when the task reaches the required
completion / verification state. 4. Respect dependencies. 5. Be recorded
with the task ID and evidence. 6. Be auditable.

Queued XP / potential XP is not earned XP. The UI must clearly
distinguish: - Potential / queued. - Completed but awaiting
verification. - Verified and credited.

## 17.6 Mission milestones and XP

A verified milestone may award a larger vector-specific XP amount.
Example: - Shipped Phase 1 Backend for a mission --- `+120 Money XP` in
the Profile chronology. - SaaS milestone check --- `+60 Money XP` in the
Calendar example.

A mission milestone may also: - Unlock a dependent plan. - Update
mission progress. - Unlock a badge / title. - Create a notification. -
Create a ledger entry.

## 17.7 Work records

The Mission screen shows an Action Log & Work Records area, including: -
Description of work. - XP credited. - Time spent / focus duration. -
Timestamp. - Evidence attachment. - Verification status.

Work records should be append-only. Edits should preserve the previous
version or create an audit event.

------------------------------------------------------------------------

# 18. Calendar and daily activity audit

The Calendar screen is a timeline and proof-of-work view. It shows: -
Annual activity matrix / heatmap. - Daily activity summary. - XP earned
on selected day. - Commitment hits. - Qualifying logs. - Day planner /
time-block schedule. - Mind, Muscle, Money, and rest streams. - Daily
commitment execution. - Mission tasks. - Daily XP ledger. - Tamper-proof
audit / sync hash. - Daily reflection and debrief.

The Calendar does not award XP independently. It displays source events
and ledger records.

## 18.1 Daily activity matrix

A day can be: - Active. - Rest. - Unlogged. - Partial / low intensity. -
High intensity.

Do not equate a rest day with a failed day. The design explicitly calls
out distinguishing confirmed rest days from unlogged days.

## 18.2 Daily summary

A daily summary should aggregate: - Total XP earned. - Commitments
hit. - Qualifying logs. - Vector XP breakdown. - Completed missions /
tasks. - Workout details. - Focus sessions. - Nutrition and hydration
targets. - Reflection / debrief.

## 18.3 Ledger audit

Calendar's ledger should be a read-only view of the same immutable XP
ledger used by Character and Profile. It must not create a second ledger
or calculate XP independently.

------------------------------------------------------------------------

# 19. Analytics and telemetry

Analytics is read-only. It aggregates events and progression data over a
selected period.

The Analytics design includes: - Date range filters (This Week, Last
Week, Last 30 Days, This Month, Last 90 Days, Custom). - Stream filter
(All, Mind, Muscle, Money). - Total XP yield for the period. - Hero tier
/ status. - Deep Work Engine execution. - Execution adherence. -
Three-attribute distribution. - System equilibrium. - Mind telemetry:
reading velocity, focus sessions, screen time, current book /
resource. - Muscle telemetry: volume, hard set distribution, sleep,
hydration, protein, PRs. - Money telemetry: active tracks, revenue
milestone, strategic deep time, business sprints.

## 19.1 Analytics rules

-   All metrics must be derived from source records or ledger events.
-   Period filters use a clearly defined timezone.
-   Lifetime XP must not be mislabeled as period XP.
-   XP distribution must be calculated from ledger entries for the
    selected period.
-   Harmony must use the same calculation service as Character /
    Profile.
-   Analytics must not award XP.
-   Historical values should remain reproducible if reward rules change
    later.

------------------------------------------------------------------------

# 20. Notifications

The Notifications screen is a centralized asynchronous telemetry feed.
It shows: - Unread transmissions. - Delivery integrity. - Quiet hours
engine. - Zero-shame safeguard. - In-app dispatch. - Browser push. -
Daily email brief. - Quiet-hours shield. - Critical security bypass. -
Category filters. - Mark all as read. - Archive selected. -
Privacy-shielded banners.

## 20.1 Notification types

Examples visible in the design: - Attribute level-up / rank
advancement. - Quest approaching deadline. - Hydration milestone
reminder. - Personal guardian / counter-strategy reminder. - Mission
milestone completed. - Operator session authenticated. - Deep work
session logged.

## 20.2 Notification delivery

Notifications are generated from durable domain events. Delivery
channels are separate from event creation.

Store: - Notification ID. - User ID. - Event ID. - Type / category. -
Title / body. - Created time. - Read time. - Archived time. - Channel
delivery state. - Quiet-hours deferred state. - Privacy classification.

## 20.3 Quiet hours and privacy

-   Quiet hours defer non-essential notifications.
-   Critical security alerts may bypass quiet hours according to the
    user's settings.
-   Privacy shielding masks sensitive enemy names, financial amounts,
    and personal habits in lock-screen / browser banners.
-   A notification must not expose private Nutrition, Workout, Money, or
    Habit details to an unauthorized viewer.
-   "Zero shame" means reminders should be supportive, not punitive.

------------------------------------------------------------------------

# 21. Profile, character identity, and privacy

The Profile screen is the character sheet and identity center. It
includes: - Avatar and display identity. - Equipped title. - Current
rank and character level. - Lifetime accumulated XP. - Current level
threshold and progress. - Estimated time to level-up (optional
estimate). - Tri-vector equilibrium. - Active streak. - Quests
cleared. - Account age / days active. - Attribute cards. - Official rank
ladder. - Badges and titles. - Milestone chronology and immutable XP
ledger. - Profile visibility. - Timezone and credentials. - 2FA / auth
state. - Celebration preferences. - Streak safeguards. - Export JSON /
CSV. - Danger zone / account deletion.

## 21.1 Privacy defaults

The Profile design marks the profile private / only you. It says quests,
workout tonnage, and financial logs are strictly confidential; guild
members only see approved identity fields such as title, level, and
public badges.

Implement explicit visibility settings: - Private (default). - Friends /
guild. - Public (only if supported and explicitly opted into).

Never expose detailed nutrition, health, workout, habit, or financial
records by default.

------------------------------------------------------------------------

# 22. Data model for Supabase / PostgreSQL

Adapt the schema to existing project tables. Do not create duplicate
sources of truth.

## 22.1 Core user / character

### `profiles`

-   `id` uuid PK, references `auth.users`
-   `display_name`
-   `avatar_url`
-   `timezone` (IANA timezone)
-   `profile_visibility`
-   `created_at`
-   `updated_at`

### `character_progress`

-   `user_id` PK
-   `lifetime_xp` bigint (cached, rebuildable)
-   `character_level` int (cached, derived)
-   `rank_id`
-   `harmony_score` numeric (cached, derived)
-   `current_streak` int (cached, if character-level streak is defined)
-   `updated_at`

### `vector_progress`

-   `user_id`
-   `vector` enum: `mind`, `muscle`, `money`
-   `lifetime_xp` bigint (cached, rebuildable)
-   `vector_level` int (cached, derived)
-   `tier_xp` bigint (cached, derived)
-   `tier_xp_required` bigint (cached, derived)
-   `updated_at`
-   Unique `(user_id, vector)`

## 22.2 XP events and ledger

### `progression_events`

-   `id`
-   `user_id`
-   `event_key`
-   `source_type`
-   `source_id`
-   `occurred_at`
-   `local_date`
-   `timezone`
-   `verification_level`
-   `metadata` jsonb
-   `created_at`
-   Unique `(user_id, event_key)`

### `xp_ledger`

-   `id`
-   `user_id`
-   `event_id`
-   `vector`
-   `xp_delta` integer
-   `reward_key`
-   `reason_code`
-   `description`
-   `rule_version`
-   `correction_of_id` nullable
-   `created_at`
-   Unique `(event_id, reward_key)` for normal award entries

Ledger entries are append-only. Corrections are new rows referencing the
original.

## 22.3 Configuration

### `xp_reward_rules`

-   `id`
-   `rule_key`
-   `source_type`
-   `vector`
-   `base_xp`
-   `cap_scope`
-   `cap_count`
-   `cooldown_seconds`
-   `eligibility_config` jsonb
-   `verification_level`
-   `active_from`
-   `active_to`
-   `config_version`

### `level_thresholds`

-   `scope` (`character`, `mind`, `muscle`, `money`)
-   `level`
-   `total_xp_required`
-   `config_version`
-   Unique `(scope, level, config_version)`

### `rank_definitions`

-   `id`
-   `rank_code` (`E`, `D`, `C`, `B`, `A`, `S`, `SS`, `SSS`)
-   `name`
-   `min_character_level`
-   `max_character_level`
-   `requirements` jsonb
-   `rewards` jsonb
-   `sort_order`
-   `config_version`
-   `is_active`

## 22.4 Badges, titles, and perks

### `badge_definitions`

-   `id`
-   `code`
-   `name`
-   `description`
-   `vector` nullable for cross-vector
-   `tier`
-   `criteria_type`
-   `criteria_config` jsonb
-   `reward_xp`
-   `reward_vector`
-   `title_unlock_id` nullable
-   `perk_unlock_id` nullable
-   `is_hidden`
-   `is_active`
-   `config_version`

### `user_badges`

-   `id`
-   `user_id`
-   `badge_id`
-   `unlocked_at`
-   `source_event_id`
-   `progress_snapshot` jsonb
-   Unique `(user_id, badge_id)`

### `title_definitions`

-   `id`
-   `code`
-   `name`
-   `unlock_criteria` jsonb

### `user_titles`

-   `user_id`
-   `title_id`
-   `unlocked_at`
-   `equipped_at` nullable
-   Unique `(user_id, title_id)`

### `perk_definitions` / `user_perks`

Store the effect definition, unlock source, activation state, and audit
history. Do not store an ambiguous perk name without a defined effect.

## 22.5 Habits and streaks

### `habit_protocols`

-   `id`
-   `user_id`
-   `name`
-   `vector`
-   `description`
-   `completion_type`
-   `target_value`
-   `target_unit`
-   `schedule_config` jsonb
-   `reward_rule_key`
-   `status`
-   `effective_from`
-   `effective_to`

### `habit_occurrences`

-   `id`
-   `user_id`
-   `habit_id`
-   `scheduled_local_date`
-   `target_snapshot`
-   `status`
-   `completed_at`
-   `logged_value`
-   `logged_unit`
-   Unique `(habit_id, scheduled_local_date)` where one occurrence per
    day is intended.

### `habit_streaks`

-   `user_id`
-   `habit_id`
-   `current_streak`
-   `best_streak`
-   `last_qualified_local_date`
-   `updated_at`

## 22.6 Nutrition

### `nutrition_days`

-   `id`
-   `user_id`
-   `local_date`
-   `timezone`
-   `protein_target_snapshot`
-   `protein_total`
-   `protein_target_reached_at`
-   `protein_reward_event_id`
-   Unique `(user_id, local_date)` if using calendar-day cycles.

### `food_entries`

Store source food, quantity, portion, macro values, verification source,
meal, timestamp, and owner. XP must be calculated from accepted entries
and target snapshots.

## 22.7 Workout

### `workout_sessions`

-   `id`
-   `user_id`
-   `routine_id`
-   `started_at`
-   `completed_at`
-   `status`
-   `duration_seconds`
-   `total_tonnage`
-   `xp_event_id`

### `workout_sets`

Store exercise, set index, load, reps, RPE, notes, status, unit, and
timestamps.

### `personal_records`

Store exercise, metric, value, unit, achieved time, source set,
verification state, and prior record reference.

## 22.8 Focus / reading / Money

Create domain-specific source tables for: - Focus sessions. - Reading
sessions / progress. - Money actions. - Revenue milestones. - Client
deliveries / invoices.

Each source record must have an owner, completion / verification state,
timestamps, and a stable identifier that can be referenced by
progression events.

## 22.9 Quests and missions

### `quests`

-   `id`
-   `user_id` or `template_id`
-   `title`
-   `vector`
-   `start_at`
-   `end_at`
-   `status`
-   `completion_criteria` jsonb
-   `reward_config` jsonb

### `quest_progress`

-   `quest_id`
-   `user_id`
-   `progress_value`
-   `status`
-   `completed_at`

### `missions`

-   `id`
-   `user_id`
-   `title`
-   `vector`
-   `description`
-   `definition_of_done`
-   `deadline`
-   `status`
-   `progress`
-   `health_status`

### `mission_plans`

Store phase order, due date, dependencies, completion criteria, weight,
and status.

### `mission_tasks`

Store plan, vector, title, description, weight, priority, due date,
dependencies, reward rule, status, and verification state.

### `mission_work_records`

Store task / milestone link, work description, time spent, evidence,
verification status, verified by, and timestamps.

### `mission_milestones`

Store success criteria, weight, dependencies, status, verification,
reward rule, and completion time.

## 22.10 Enemies, notifications, calendar

Add tables for: - `enemy_challenges` - `defense_events` -
`notification_events` - `notification_deliveries` - `daily_summaries` -
`leaderboard_visibility` if social / guild features are shipped.

Calendar and Analytics should read from source records, summaries, and
the XP ledger rather than maintain independent progression state.

------------------------------------------------------------------------

# 23. Backend processing architecture

## 23.1 Trusted event flow

``` text
User action
   |
   v
Domain API / Edge Function
   |
   v
Validate auth + record ownership
   |
   v
Validate domain completion
   |
   v
Create idempotent progression event
   |
   v
Evaluate XP rule + cap
   |
   v
Append vector XP ledger entry
   |
   v
Recompute vector + character totals
   |
   v
Recompute vector levels + character level
   |
   v
Recompute harmony
   |
   v
Evaluate rank eligibility
   |
   v
Evaluate badges / titles / perks
   |
   v
Create durable notifications
   |
   v
Refresh Dashboard / Character / Analytics / Calendar
```

## 23.2 Transaction requirements

The following must be atomic or safely retryable: - Event idempotency. -
XP ledger insert. - Cached XP summary update. - Level / rank
recomputation. - Badge unlock insert. - Badge reward ledger insert. -
Notification event creation.

Use database transactions or a reliable outbox / event-processing
pattern. Handle unique constraint conflicts as successful duplicate
processing, not as a second reward.

## 23.3 Rebuildability

Cached totals are for performance only. The system must be able to
rebuild: - Vector XP totals. - Character lifetime XP. - Vector levels. -
Character level. - Rank eligibility. - Harmony score. - Badge progress
where derived from source data.

The ledger and domain source records are authoritative.

------------------------------------------------------------------------

# 24. Security and Supabase rules

1.  Enable Row Level Security on all user-owned tables.
2.  Users can read their own private data.
3.  Public / guild profile reads expose only fields explicitly approved
    by visibility settings.
4.  Clients cannot directly insert XP ledger entries.
5.  Clients cannot update lifetime XP, vector XP, levels, rank, harmony,
    or badge unlock state.
6.  XP awards run through trusted server-side code or secured database
    functions.
7.  Never expose the Supabase service-role key in the client.
8.  Validate ownership for every referenced domain record.
9.  Use unique constraints for event idempotency and badge uniqueness.
10. Use database transactions for progression changes.
11. Validate all numeric values, units, timestamps, and source records.
12. Store UTC timestamps and the resolved local date / timezone used for
    daily rules.
13. Keep audit trails for verification and XP corrections.
14. Apply rate limits to event creation, mission updates, and
    notification endpoints.
15. Do not trust client-supplied XP amounts, vector IDs, verification
    flags, or completion claims.

------------------------------------------------------------------------

# 25. Timezone and date handling

The designs show `Asia/Kolkata` as an example timezone and local
schedule labels.

Implementation: - Store timestamps in UTC. - Store the user's IANA
timezone. - Calculate scheduled local dates using that timezone. - Save
the resolved `local_date` on the event. - Do not recalculate historical
reward dates after a timezone change. - Define whether the protein
reward cycle is a local calendar day or a rolling 24-hour window. The
Nutrition screen says once per 24-hour cycle; the product must choose
the exact policy. - Apply the same daily boundary consistently across
Habits, Quests, Calendar, and XP caps. - Distinguish rest days, unlogged
days, and missed scheduled days.

------------------------------------------------------------------------

# 26. Notification and UI feedback states

Every progression event should have an appropriate user-visible state:

  Event                     UI feedback
  ------------------------- --------------------------------------
  XP awarded                Show vector, amount, and reason
  Vector level-up           Show attribute level-up
  Character level-up        Show character level-up
  Rank eligibility          Show requirements met / unmet
  Rank promotion            Show rank-up and unlocked rewards
  Badge unlocked            Show badge, criteria, vector, reward
  Title unlocked            Add to titles vault
  Perk unlocked             Explain exact effect
  Quest progress            Update progress / completion
  Mission task completed    Update plan / mission progress
  Milestone verified        Show verification and XP credit
  Streak milestone          Show streak / momentum update
  XP pending verification   Show queued / pending state
  Duplicate event           No second celebration or XP

Do not show "XP earned" until the backend confirms the ledger entry.
Offline actions can show pending sync, then confirmed / rejected state.

------------------------------------------------------------------------

# 27. Edge cases and non-destructive safeguards

1.  Duplicate button tap must not double-award XP.
2.  Retried API request must return the original reward result.
3.  A client cannot award XP to another user.
4.  Editing a completed record must not issue a second reward.
5.  Deleting a source record must not silently delete ledger history.
6.  A corrected record requires an audited correction entry.
7.  Missed habits never subtract lifetime XP.
8.  Broken streaks never delete badges or levels.
9.  Rest days are not automatically failures.
10. Unlogged days must remain distinguishable from confirmed missed
    days.
11. Timezone changes do not rewrite historical local dates.
12. Nutrition target changes must not retroactively alter the target
    snapshot used for an already processed reward.
13. Protein target crossing is rewarded once per configured cycle.
14. Multiple PR edits must not create repeated rewards.
15. A workout session must not award completion XP while merely in
    progress.
16. A mission task cannot award its reward twice.
17. A queued / potential XP reward is not earned until its completion /
    verification condition is met.
18. Mission progress must not exceed 100%.
19. Dependent plans cannot unlock until dependencies are satisfied and
    verified.
20. Badge criteria changes must preserve previously earned badges.
21. Rank configuration changes must not silently downgrade users.
22. Harmony recalculation may change the score but must not delete XP.
23. A notification retry must not create duplicate notifications.
24. Quiet hours defer delivery; they do not lose the underlying
    notification.
25. Private health, nutrition, workout, habit, and financial data must
    not leak into public notifications or leaderboards.

------------------------------------------------------------------------

# 28. Acceptance tests

## XP and vectors

-   A valid Mind action credits Mind XP, not Muscle or Money.
-   A valid Muscle action credits Muscle XP.
-   A valid Money action credits Money XP.
-   Lifetime XP equals the sum of vector XP ledger totals.
-   A repeated event key cannot create another award.
-   An invalid or cross-user source record awards zero XP.
-   A cap prevents extra reward without blocking valid activity logging.
-   XP corrections are appended and auditable.

## Vector levels

-   Each vector level is calculated from that vector's lifetime XP.
-   A Mind level-up does not directly change Muscle or Money level.
-   Tier progress is accurate at threshold boundaries.
-   Current tier XP never exceeds the configured tier requirement after
    recomputation.

## Character level

-   Character level is calculated from lifetime XP using the approved
    character threshold table.
-   Vector levels and character level can differ.
-   Level-up events are emitted only when a threshold is crossed.
-   Lifetime XP is never confused with current-tier XP.

## Harmony

-   Harmony is calculated from normalized vector scores.
-   The same service returns the same score to Profile and Analytics.
-   A low vector can affect eligibility / progression gating but never
    deletes earned XP.
-   The exact normalization formula is documented and approved before
    release.

## Ranks

-   Rank C is Warrior for levels 20--29, as shown.
-   Rank B is Elite for levels 30--44, as shown.
-   Rank B eligibility checks Level 30, 65,000 lifetime XP, and the
    required vector-level conditions shown in the design.
-   Higher-rank requirements are configurable and cannot be guessed from
    level ranges alone.
-   A rank-up is durable and creates a notification / chronology event.

## Badges and titles

-   A badge unlocks only when its criteria are satisfied.
-   Badge unlocks are unique per user.
-   Badge reward XP is credited once to its configured vector.
-   A badge can unlock a title or perk.
-   Titles can be equipped only if unlocked.
-   Earned badges remain earned after criteria changes.

## Habits and streaks

-   A protocol completion awards its configured vector XP once.
-   Numeric target updates do not repeatedly reward the same occurrence.
-   Missed protocols award zero XP and do not subtract XP.
-   Unscheduled days are not counted as missed.
-   Best streak is permanent.
-   Cross-vector 14-day badge requires qualifying Mind, Muscle, and
    Money activity on every required day.

## Nutrition

-   Protein reward is credited once per configured cycle.
-   Target snapshot is retained.
-   Repeated micro-entries do not create multiple rewards.
-   Arbitrary calorie changes do not award XP.

## Workout

-   Only completed valid sessions can earn workout XP.
-   PR comparison uses compatible exercise / metric / unit.
-   Re-entering an existing PR does not award a new PR bonus.
-   Tonnage is calculated from eligible completed sets.

## Quests and missions

-   Quest completion is server-validated.
-   Mission progress uses the approved weighted formula.
-   Task XP is queued until the required state / verification.
-   Dependencies are enforced.
-   Milestone rewards are credited once.
-   Boss challenge progress and reset rules match the approved design.

## Privacy and notifications

-   Private profile is private by default.
-   Public / guild fields are explicitly allowlisted.
-   Quiet hours defer non-critical notifications.
-   Critical security notifications follow the configured bypass policy.
-   Sensitive content is masked in lock-screen / browser notifications.

------------------------------------------------------------------------

# 29. Implementation order

Build the system in dependency order.

## Phase 1 --- Data foundation

1.  Inspect the existing Supabase schema.
2.  Confirm domain source tables for habits, nutrition, workouts, focus,
    Money, quests, and missions.
3.  Add progression event identity and idempotency.
4.  Create append-only vector XP ledger.
5.  Add vector and character progression summaries.
6.  Add RLS and server-only reward writes.

## Phase 2 --- Core progression

7.  Implement configurable XP rules.
8.  Implement vector XP totals and vector levels.
9.  Implement character lifetime XP and character level.
10. Implement the approved harmony normalization and formula.
11. Implement rank definitions and eligibility.

## Phase 3 --- Achievements

12. Implement badge definitions and evaluators.
13. Implement title vault and equipped title.
14. Implement perk definitions only after effects are approved.
15. Add level-up, rank-up, and badge notifications.

## Phase 4 --- Domain integrations

16. Connect Habit protocols and streaks.
17. Connect Nutrition protein / hydration reward rules.
18. Connect Workout completion, tonnage, and PR logic.
19. Connect Focus / reading events.
20. Connect Money actions and verification.
21. Connect Quest and boss progress.
22. Connect Mission plans, tasks, work records, and milestones.

## Phase 5 --- Read models and polish

23. Build Dashboard progression summaries.
24. Build Character / Profile sheet.
25. Build Calendar daily audit.
26. Build Analytics aggregations.
27. Build Notifications delivery / quiet hours.
28. Add data export and privacy controls.

## Phase 6 --- Validation

29. Simulate progression over 7, 30, 90, and 365 days.
30. Test balance across all three vectors.
31. Test anti-farming and idempotency.
32. Test rank gates and badge criteria.
33. Test timezone, offline, and retry behaviour.
34. Run acceptance tests before production.

------------------------------------------------------------------------

# 30. Product decisions required before final production logic

The designs provide a strong system model, but the following details are
not completely defined by the screens. Confirm them before hard-coding:

1.  **Vector level curve:** Is every vector level exactly 1,000 XP, or
    is there a scaling threshold table?
2.  **Character level curve:** What are the cumulative XP thresholds for
    each overall character level?
3.  **Harmony normalization:** How are Mind, Muscle, and Money converted
    to 0--100 before applying `0.4 × min + 0.6 × average`?
4.  **Harmony gating:** What minimum harmony score is required for each
    rank promotion?
5.  **Rank requirements:** What are the exact requirements for Novice,
    Apprentice, Warrior, Master, Grandmaster, Legend, and Mythic? Only
    the visible Warrior / Elite ranges and the Elite example gate should
    be treated as confirmed.
6.  **Elite gate boundary:** Does "Mind / Muscle / Money \>25" mean each
    vector must be Level 26+, or does Level 25 qualify?
7.  **XP reward table:** Confirm all action values and whether rewards
    vary by difficulty, task, or verification.
8.  **Workout XP:** Confirm how session XP, PR XP, and volume bonuses
    combine.
9.  **Nutrition cycle:** Confirm local calendar day versus rolling 24
    hours for the +40 Muscle XP protein reward.
10. **Streak behaviour:** Confirm whether a missed scheduled day pauses,
    breaks, or receives a grace period for the current streak. Lifetime
    progress remains non-destructive.
11. **Quest expiry:** Confirm what happens to unfinished daily quests.
12. **Boss HP:** Define the progress / damage formula and non-punitive
    missed-day behaviour.
13. **Mission verification:** Define which task and milestone types
    require system verification or evidence.
14. **Cross-vector badge:** Confirm the exact minimum daily activity
    needed in each vector for Consistent Striker.
15. **Perk effects:** Define actual effects for Equilibrium Perk and
    future rank / badge perks.
16. **Guild / leaderboard:** Confirm whether social visibility is in v1
    and which fields can be public.

------------------------------------------------------------------------

# 31. Non-negotiable system rules

-   M3 Triad progression is built around Mind, Muscle, and Money.
-   Each vector has its own XP and level.
-   Character level is separate from vector levels.
-   Lifetime XP is the sum of credited vector XP.
-   Harmony measures balance and supports non-destructive progression
    gating.
-   Ranks are earned through configured level, XP, and vector-stability
    requirements.
-   Badges recognize verifiable milestones and may award XP / titles /
    perks.
-   Habits are protocols, assigned to a vector, with non-punitive
    missed-day handling.
-   Nutrition protein reward is verified and capped once per 24-hour
    cycle as shown.
-   Workout XP is based on valid completed sessions and verified PR
    logic.
-   Quests are bounded objectives; Missions are strategic goal
    hierarchies.
-   Mission tasks and milestones can produce vector XP after completion
    / verification.
-   Calendar and Analytics are read-only views of source data and the
    ledger.
-   Notifications are durable, privacy-aware, and quiet-hours capable.
-   The XP ledger is immutable and auditable.
-   The server is authoritative for XP, levels, ranks, harmony, badges,
    and rewards.
-   No missed day, broken streak, or failed quest deletes lifetime XP,
    earned levels, or unlocked badges.
-   Do not implement unconfirmed formulas or rank gates by guessing.

**M3 Triad is a system for building a balanced life. The RPG layer
should make real progress visible, reward meaningful execution, and
protect the user's long-term effort.**
