# Source Review Notes

Reviewed all 10 supplied SVG files by inspecting SVG dimensions, structure, embedded images, colour usage, and rendered full-page previews with OCR as a secondary aid.

## Shared observations
- Most full pages are 1280px wide, with a 256px left rail and main content beginning near x=296px.
- The page canvas is consistently warm off-white `#FCF9F8`; surfaces are predominantly white.
- Strong dark outlines `#1C1B1B`, secondary ink `#464555`, compact uppercase labels and modular bordered panels recur throughout.
- Purple, green and red accents recur, but their meanings are not perfectly consistent across every screen. This is why the design system defines semantic usage and does not permanently assign each vector a colour.
- The references are dense desktop dashboard compositions. Responsive/mobile states are not represented comprehensively.
- SVG text is primarily outlined as vector paths; the original font family cannot be confidently recovered from source metadata.

## Per-screen evidence summary
- Dashboard: greeting, character/status summary, daily quests, priorities and snapshot/quick-action areas.
- Missions: quest/mission overview, project/milestone progress, task execution plan, task list and action/work records.
- Workout: routine/session execution, set logging, progressive overload, tonnage/volume, templates, PRs and history.
- Nutrition: calorie/macro targets, remaining intake, meal groups, food entries, serving sizes and food discovery.
- Notifications: inbox/dispatch, priority/read states, archive actions, channels, quiet hours and subscriptions.
- Habits: scheduled protocols, adherence, streaks, templates, momentum and protection/counter-action concepts.
- Profile: identity, level/XP, tri-vector architecture, ranks, achievements, chronology, XP ledger and privacy/security.
- Analytics: executive telemetry, three-vector distribution and vector-specific metrics/trends.
- Calendar: annual activity matrix, selected day, time-block planner, daily commitments, task chronology, XP ledger and reflection.
- Aside: persistent LIFE RPG brand/navigation rail and status area.

## Caution
OCR output is imperfect and was not used as the sole basis for the specification. Where exact wording, formulas, or interactions are unclear, the handoff marks them as proposals or open questions rather than treating them as confirmed facts.
