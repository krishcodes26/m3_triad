/**
 * M3 Triad Progression Configuration
 * 
 * This file defines all the configurable thresholds, XP rules, and progression
 * mechanics. It serves as the single source of truth for progression mechanics.
 */

import type { Vector } from '@/types/database';

// ============================================================================
// VECTOR LEVEL CONFIGURATION
// ============================================================================

/**
 * Cumulative XP required to reach each level per vector.
 * Uses a progressive scaling curve.
 */
export const VECTOR_LEVEL_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 500,
  3: 1_200,
  4: 2_100,
  5: 3_200,
  6: 4_500,
  7: 6_000,
  8: 7_700,
  9: 9_600,
  10: 11_700,
  11: 14_000,
  12: 16_500,
  13: 19_200,
  14: 22_100,
  15: 25_200,
  16: 28_500,
  17: 32_000,
  18: 35_700,
  19: 39_600,
  20: 43_700,
  21: 48_000,
  22: 52_500,
  23: 57_200,
  24: 62_100,
  25: 67_200,
  26: 72_500,
  27: 78_000,
  28: 83_700,
  29: 89_600,
  30: 95_700,
};

// ============================================================================
// CHARACTER LEVEL CONFIGURATION
// ============================================================================

/**
 * Cumulative lifetime XP required to reach each character level.
 * Character level is based on total XP from all three vectors.
 * Uses a steeper scaling curve than individual vectors.
 */
export const CHARACTER_LEVEL_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 1_500,
  3: 3_600,
  4: 6_300,
  5: 9_600,
  6: 13_500,
  7: 18_000,
  8: 23_100,
  9: 28_800,
  10: 35_100,
  11: 42_000,
  12: 49_500,
  13: 57_600,
  14: 66_300,
  15: 75_600,
  16: 85_500,
  17: 96_000,
  18: 107_100,
  19: 118_800,
  20: 131_100,
  21: 144_000,
  22: 157_500,
  23: 171_600,
  24: 186_300,
  25: 201_600,
  26: 217_500,
  27: 234_000,
  28: 251_100,
  29: 268_800,
  30: 287_100,
  31: 306_000,
  32: 325_500,
  33: 345_600,
  34: 366_300,
  35: 387_600,
  36: 409_500,
  37: 432_000,
  38: 455_100,
  39: 478_800,
  40: 503_100,
};

// ============================================================================
// RANK DEFINITIONS
// ============================================================================

export interface RankConfig {
  code: string;
  name: string;
  minCharacterLevel: number;
  maxCharacterLevel: number;
  minLifetimeXp: number;
  minVectorLevels: { mind: number; muscle: number; money: number };
  minHarmonyScore: number;
}

export const RANKS: Record<string, RankConfig> = {
  E: {
    code: 'E',
    name: 'Novice',
    minCharacterLevel: 1,
    maxCharacterLevel: 19,
    minLifetimeXp: 0,
    minVectorLevels: { mind: 1, muscle: 1, money: 1 },
    minHarmonyScore: 0,
  },
  D: {
    code: 'D',
    name: 'Apprentice',
    minCharacterLevel: 20,
    maxCharacterLevel: 29,
    minLifetimeXp: 50_000,
    minVectorLevels: { mind: 10, muscle: 10, money: 10 },
    minHarmonyScore: 60,
  },
  C: {
    code: 'C',
    name: 'Warrior',
    minCharacterLevel: 20,
    maxCharacterLevel: 29,
    minLifetimeXp: 100_000,
    minVectorLevels: { mind: 15, muscle: 15, money: 15 },
    minHarmonyScore: 70,
  },
  B: {
    code: 'B',
    name: 'Elite',
    minCharacterLevel: 30,
    maxCharacterLevel: 44,
    minLifetimeXp: 65_000,
    minVectorLevels: { mind: 25, muscle: 25, money: 25 },
    minHarmonyScore: 75,
  },
  A: {
    code: 'A',
    name: 'Master',
    minCharacterLevel: 45,
    maxCharacterLevel: 59,
    minLifetimeXp: 150_000,
    minVectorLevels: { mind: 35, muscle: 35, money: 35 },
    minHarmonyScore: 80,
  },
  S: {
    code: 'S',
    name: 'Grandmaster',
    minCharacterLevel: 60,
    maxCharacterLevel: 74,
    minLifetimeXp: 250_000,
    minVectorLevels: { mind: 45, muscle: 45, money: 45 },
    minHarmonyScore: 85,
  },
  SS: {
    code: 'SS',
    name: 'Legend',
    minCharacterLevel: 75,
    maxCharacterLevel: 89,
    minLifetimeXp: 400_000,
    minVectorLevels: { mind: 55, muscle: 55, money: 55 },
    minHarmonyScore: 90,
  },
  SSS: {
    code: 'SSS',
    name: 'Mythic',
    minCharacterLevel: 90,
    maxCharacterLevel: 999,
    minLifetimeXp: 600_000,
    minVectorLevels: { mind: 65, muscle: 65, money: 65 },
    minHarmonyScore: 92,
  },
};

// ============================================================================
// XP REWARD RULES
// ============================================================================

export interface XpRewardRule {
  key: string;
  sourceType: string;
  vector: Vector;
  baseXp: number;
  bonusXp?: number;
  capScope: 'per_event' | 'per_day' | 'per_week' | 'per_month';
  capCount?: number;
  cooldownSeconds?: number;
  verificationLevel: 'self_reported' | 'app_validated' | 'integration_verified';
}

export const XP_REWARD_RULES: Record<string, XpRewardRule> = {
  // ── MIND VECTOR ──────────────────────────────────────────────────────
  'mind:focus_session_completed': {
    key: 'mind:focus_session_completed',
    sourceType: 'focus_session',
    vector: 'mind',
    baseXp: 15,
    capScope: 'per_event',
    verificationLevel: 'app_validated',
  },
  'mind:reading_target': {
    key: 'mind:reading_target',
    sourceType: 'reading',
    vector: 'mind',
    baseXp: 20,
    capScope: 'per_day',
    capCount: 1,
    verificationLevel: 'self_reported',
  },
  'mind:deep_work_90min': {
    key: 'mind:deep_work_90min',
    sourceType: 'focus_session',
    vector: 'mind',
    baseXp: 40,
    capScope: 'per_day',
    capCount: 1,
    verificationLevel: 'app_validated',
  },
  'mind:study_session': {
    key: 'mind:study_session',
    sourceType: 'focus_session',
    vector: 'mind',
    baseXp: 30,
    capScope: 'per_event',
    verificationLevel: 'app_validated',
  },

  // ── MUSCLE VECTOR ────────────────────────────────────────────────────
  'muscle:workout_completed': {
    key: 'muscle:workout_completed',
    sourceType: 'workout_session',
    vector: 'muscle',
    baseXp: 50,
    bonusXp: 20, // PR bonus
    capScope: 'per_event',
    verificationLevel: 'app_validated',
  },
  'muscle:workout_tonnage_milestone': {
    key: 'muscle:workout_tonnage_milestone',
    sourceType: 'workout_session',
    vector: 'muscle',
    baseXp: 25,
    capScope: 'per_event',
    verificationLevel: 'app_validated',
  },
  'muscle:protein_target': {
    key: 'muscle:protein_target',
    sourceType: 'nutrition',
    vector: 'muscle',
    baseXp: 40,
    capScope: 'per_day',
    capCount: 1,
    verificationLevel: 'app_validated',
  },
  'muscle:hydration_target': {
    key: 'muscle:hydration_target',
    sourceType: 'nutrition',
    vector: 'muscle',
    baseXp: 20,
    capScope: 'per_day',
    capCount: 1,
    verificationLevel: 'app_validated',
  },
  'muscle:sleep_target': {
    key: 'muscle:sleep_target',
    sourceType: 'sleep',
    vector: 'muscle',
    baseXp: 25,
    capScope: 'per_day',
    capCount: 1,
    verificationLevel: 'app_validated',
  },
  'muscle:pr_achieved': {
    key: 'muscle:pr_achieved',
    sourceType: 'personal_record',
    vector: 'muscle',
    baseXp: 75,
    capScope: 'per_event',
    verificationLevel: 'app_validated',
  },

  // ── MONEY VECTOR ─────────────────────────────────────────────────────
  'money:daily_action': {
    key: 'money:daily_action',
    sourceType: 'money_action',
    vector: 'money',
    baseXp: 30,
    capScope: 'per_day',
    capCount: 2,
    verificationLevel: 'self_reported',
  },
  'money:client_milestone': {
    key: 'money:client_milestone',
    sourceType: 'mission_milestone',
    vector: 'money',
    baseXp: 60,
    capScope: 'per_event',
    verificationLevel: 'integration_verified',
  },
  'money:revenue_milestone': {
    key: 'money:revenue_milestone',
    sourceType: 'revenue_tracker',
    vector: 'money',
    baseXp: 100,
    capScope: 'per_event',
    verificationLevel: 'integration_verified',
  },

  // ── HABIT COMPLETIONS ────────────────────────────────────────────────
  'habit:protocol_completed': {
    key: 'habit:protocol_completed',
    sourceType: 'habit_check_in',
    vector: 'mind', // Variable per habit
    baseXp: 15,
    capScope: 'per_event',
    verificationLevel: 'app_validated',
  },

  // ── MISSION & TASK ───────────────────────────────────────────────────
  'mission:task_completed': {
    key: 'mission:task_completed',
    sourceType: 'task',
    vector: 'mind', // Variable per task
    baseXp: 50,
    capScope: 'per_event',
    verificationLevel: 'app_validated',
  },
  'mission:milestone_verified': {
    key: 'mission:milestone_verified',
    sourceType: 'mission_milestone',
    vector: 'mind', // Variable per milestone
    baseXp: 120,
    capScope: 'per_event',
    verificationLevel: 'integration_verified',
  },
};

// ============================================================================
// HARMONY / EQUILIBRIUM CONFIGURATION
// ============================================================================

/**
 * Harmony score calculation:
 * harmony = (min_score × 0.4) + (avg_score × 0.6)
 * 
 * Where scores are normalized to 0-100 based on vector levels.
 */
export const HARMONY_CONFIG = {
  minWeight: 0.4,
  avgWeight: 0.6,
  minScoreForRankBonus: 75,
  minScoreForNewRank: 70,
};

// ============================================================================
// BADGE DEFINITIONS
// ============================================================================

export interface BadgeDefinition {
  code: string;
  name: string;
  description: string;
  vector: Vector | 'cross';
  tier: number;
  criteriaType: string;
  criteriaConfig: Record<string, any>;
  rewardXp: number;
  rewardVector: Vector;
}

export const BADGES: Record<string, BadgeDefinition> = {
  'deep_work_monk': {
    code: 'deep_work_monk',
    name: 'Deep Work Monk',
    description: 'Log 100 unbroken hours of deep distraction-free work blocks',
    vector: 'mind',
    tier: 2,
    criteriaType: 'cumulative_hours',
    criteriaConfig: { targetHours: 100, sessionType: 'deep_work' },
    rewardXp: 100,
    rewardVector: 'mind',
  },
  'century_press': {
    code: 'century_press',
    name: 'Century Press',
    description: 'Validated 100 kg+ flat barbell bench press with strict form',
    vector: 'muscle',
    tier: 2,
    criteriaType: 'pr_milestone',
    criteriaConfig: { exercise: 'bench_press', minLoad: 100 },
    rewardXp: 150,
    rewardVector: 'muscle',
  },
  'first_rev_sprint': {
    code: 'first_rev_sprint',
    name: 'First Rev Sprint',
    description: 'Invoice and complete a client delivery milestone exceeding $3,000 USD',
    vector: 'money',
    tier: 1,
    criteriaType: 'revenue_milestone',
    criteriaConfig: { minRevenue: 3000 },
    rewardXp: 200,
    rewardVector: 'money',
  },
  'consistent_striker': {
    code: 'consistent_striker',
    name: 'Consistent Striker',
    description: 'Maintain unbroken daily routine habits across all 3 pillars for 14 straight days',
    vector: 'cross',
    tier: 1,
    criteriaType: 'daily_consistency',
    criteriaConfig: { days: 14, requireAllVectors: true },
    rewardXp: 100,
    rewardVector: 'mind',
  },
  'iron_pillar': {
    code: 'iron_pillar',
    name: 'Iron Pillar',
    description: 'Log 100 total high-intensity strength training sessions',
    vector: 'muscle',
    tier: 1,
    criteriaType: 'cumulative_sessions',
    criteriaConfig: { targetSessions: 100, intensity: 'high' },
    rewardXp: 250,
    rewardVector: 'muscle',
  },
  'grand_architect': {
    code: 'grand_architect',
    name: 'Grand Architect',
    description: 'Successfully ship 3 major production software architectures',
    vector: 'mind',
    tier: 3,
    criteriaType: 'mission_completions',
    criteriaConfig: { count: 3, missionTag: 'architecture' },
    rewardXp: 500,
    rewardVector: 'mind',
  },
};

// ============================================================================
// STREAKS & CADENCE
// ============================================================================

export const STREAK_CONFIG = {
  gracePeriodDays: 2, // Days before streak actually breaks
  maxStreakResetBefore: 1, // Reset before this many days
};

// ============================================================================
// CALCULATION HELPERS
// ============================================================================

/**
 * Get the threshold for a given level
 */
export function getVectorLevelThreshold(level: number): number {
  return VECTOR_LEVEL_THRESHOLDS[level] ?? VECTOR_LEVEL_THRESHOLDS[30];
}

/**
 * Get the threshold for a given character level
 */
export function getCharacterLevelThreshold(level: number): number {
  return CHARACTER_LEVEL_THRESHOLDS[level] ?? CHARACTER_LEVEL_THRESHOLDS[40];
}

/**
 * Find the highest level a given XP total reaches
 */
export function calculateLevel(xp: number, thresholds: Record<number, number>): number {
  let level = 1;
  for (const [lvl, threshold] of Object.entries(thresholds).map(([k, v]) => [parseInt(k), v] as const)) {
    if (xp >= threshold) {
      level = lvl;
    } else {
      break;
    }
  }
  return level;
}

/**
 * Calculate current tier XP (XP within the current level)
 */
export function calculateTierXp(xp: number, level: number, thresholds: Record<number, number>): number {
  const currentThreshold = thresholds[level] ?? 0;
  return Math.max(0, xp - currentThreshold);
}

/**
 * Calculate XP required for the next level
 */
export function calculateTierRequired(level: number, thresholds: Record<number, number>): number {
  const currentThreshold = thresholds[level] ?? 0;
  const nextThreshold = thresholds[level + 1] ?? thresholds[30] + 100000;
  return Math.max(0, nextThreshold - currentThreshold);
}

/**
 * Calculate tier progress as a percentage
 */
export function calculateTierProgress(xp: number, level: number, thresholds: Record<number, number>): number {
  const tierXp = calculateTierXp(xp, level, thresholds);
  const tierRequired = calculateTierRequired(level, thresholds);
  if (tierRequired === 0) return 100;
  return Math.min(100, Math.round((tierXp / tierRequired) * 100));
}
