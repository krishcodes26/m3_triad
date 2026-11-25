# M3 Triad — Application Design Direction

## 1. Overall experience

M3 Triad should feel like a personal command centre for deliberate self-development. It combines the clarity of a productivity tool, the evidence-led detail of a training log, and the motivational structure of an RPG character sheet.

The visual references are intentionally dense. Preserve that density where it communicates useful information, but do not make every section equally loud. Use hierarchy to guide the eye from:

1. What matters today?
2. What action should I take?
3. What is my current progress?
4. What evidence supports that progress?
5. What should I review or adjust?

## 2. Shared application shell

Desktop shell:
- 256px left rail, warm white surface.
- Brand lockup near top.
- Primary navigation in a single vertical list.
- Active page is strongly highlighted.
- Optional bottom character/status summary with level, XP progress, and sync status.
- Main canvas uses `#FCF9F8`.
- Main content uses consistent horizontal gutters and aligned section edges.

Navigation destinations from the references:
- Dashboard
- Character / Profile
- Missions / Quests
- Habits
- Workouts
- Analytics
- Calendar

Nutrition and Notifications are evidenced as full pages, but their exact placement in the navigation is not perfectly clear from the SVGs. They may be accessible through contextual actions or a secondary navigation group. Confirm this before final IA lock.

## 3. Page composition patterns

### Overview page
Use a concise header, character/attribute summary, daily task/quest list, priority panel, progress summaries and quick actions. Do not turn the overview into a full duplicate of every feature page.

### Workbench page
For Missions and Workout, use a clear control area, status summary, then a larger execution workspace. Support dense records and history below or beside the active task.

### Daily log page
For Nutrition and Habits, use day/date context, target/progress summary, then chronological or scheduled entries. Keep adding/logging actions easy to reach.

### Intelligence page
For Analytics, use an executive summary first, followed by tri-vector distribution and detailed per-vector telemetry. Avoid charts without interpretation.

### Timeline page
For Calendar, make date selection and chronology the organising structure. Keep annual activity matrix, time-block schedule, daily events, tasks and XP ledger logically connected.

### Identity page
For Profile, make character identity, levels, attribute distribution, achievements and history visible. Privacy and security should be a separate, clearly labelled area.

### Inbox page
For Notifications, prioritise unread/critical messages and provide predictable read/archive controls. Delivery settings should not overwhelm the inbox.

## 4. Visual hierarchy

Use these layers:
- **Layer 1:** page title, primary CTA, urgent status.
- **Layer 2:** major metrics, current mission/workout/habit state.
- **Layer 3:** supporting charts, progress breakdowns, lists.
- **Layer 4:** metadata, timestamps, IDs, secondary labels.

Only a few elements should use high-saturation colour simultaneously. Use the warm canvas and ink borders to create structure.

## 5. Card strategy

The references use many bordered modules. Keep the modular language but apply a simple rule:

- A card is for a coherent unit of information or action.
- A section is for a group of related cards.
- A divider is preferable to a nested card when content is closely related.
- A table/ledger is preferable to dozens of individual cards for repetitive records.
- Use side panels for secondary context, not for a second competing primary workflow.

## 6. Data visualisation style

- Prefer direct labels and small multiples over overly complex charts.
- Use consistent colours for the same series within an analytics view.
- Show target vs actual clearly.
- Show date range and units near the chart.
- Include summary insight, not just a graph.
- Provide a no-data state and an insufficient-data state.
- Never fabricate a trend line from sparse or sample values.

## 7. Responsive design

At desktop, preserve the side-by-side panels visible in the references. At tablet, collapse secondary panels below the primary workflow. At mobile, prioritise one task at a time:

- A compact header.
- Primary navigation via drawer or bottom bar.
- One-column cards.
- Sticky contextual CTA only when it does not obscure content.
- Dense tables transformed into readable summaries.
- Charts simplified with accessible summaries.

## 8. Avoid these design regressions

- Replacing the visual identity with generic rounded pastel cards.
- Making every attribute a different bright colour.
- Overusing purple or green as full-card backgrounds.
- Turning every label into a pill.
- Tiny text to fit the desktop SVG density.
- Using fake live values or fake integrations.
- Treating XP animation as more important than the underlying action.
- Inconsistent navigation and card anatomy between screens.
