-- ============================================================================
-- 006 — Milestone XP gates
--
-- Milestones (plans) in a quest roadmap unlock once the user has claimed enough
-- XP from completed work. `xp_required` stores an explicit gate per milestone.
-- NULL (or 0) means "sequential": the milestone unlocks when every earlier
-- milestone's potential XP has been claimed.
--
-- Apply with the Supabase SQL editor or:
--   supabase db push
-- ============================================================================

ALTER TABLE milestones
  ADD COLUMN IF NOT EXISTS xp_required INTEGER;

COMMENT ON COLUMN milestones.xp_required IS
  'Claimed-XP threshold required to unlock this milestone. NULL/0 = sequential unlock after the previous milestone.';

-- Index for roadmap reads (milestones are always read by mission_id, already
-- indexed by the FK, so nothing else is required).
