/**
 * M3 Triad Progression Calculator
 * 
 * Core calculations for XP, levels, ranks, and harmony.
 * All calculations are deterministic and can be verified against the ledger.
 */

import type { Vector } from '@/types/database';
import {
  VECTOR_LEVEL_THRESHOLDS,
  CHARACTER_LEVEL_THRESHOLDS,
  HARMONY_CONFIG,
  RANKS,
  calculateLevel,
  calculateTierXp,
  calculateTierRequired,
  calculateTierProgress,
  getVectorLevelThreshold,
  getCharacterLevelThreshold,
  type RankConfig,
} from './config';

/**
 * Complete character progression snapshot
 */
export interface CharacterProgressSnapshot {
  // XP totals
  lifetimeXp: number;
  vectorXp: {
    mind: number;
    muscle: number;
    money: number;
  };

  // Character level
  characterLevel: number;
  characterTierXp: number;
  characterTierRequired: number;
  characterTierProgress: number;

  // Vector levels
  vectorLevels: {
    mind: { level: number; xp: number; tierXp: number; tierRequired: number; progress: number };
    muscle: { level: number; xp: number; tierXp: number; tierRequired: number; progress: number };
    money: { level: number; xp: number; tierXp: number; tierRequired: number; progress: number };
  };

  // Harmony
  harmonyScore: number;
  vectorScores: {
    mind: number;
    muscle: number;
    money: number;
  };

  // Rank
  currentRank: RankConfig;
  eligibleForRanks: RankConfig[];
}

/**
 * Calculate vector level for a given XP amount
 */
export function calculateVectorLevel(vectorXp: number): {
  level: number;
  tierXp: number;
  tierRequired: number;
  progress: number;
} {
  const level = calculateLevel(vectorXp, VECTOR_LEVEL_THRESHOLDS);
  const tierXp = calculateTierXp(vectorXp, level, VECTOR_LEVEL_THRESHOLDS);
  const tierRequired = calculateTierRequired(level, VECTOR_LEVEL_THRESHOLDS);
  const progress = calculateTierProgress(vectorXp, level, VECTOR_LEVEL_THRESHOLDS);

  return { level, tierXp, tierRequired, progress };
}

/**
 * Calculate character level for a given lifetime XP
 */
export function calculateCharacterLevel(lifetimeXp: number): {
  level: number;
  tierXp: number;
  tierRequired: number;
  progress: number;
} {
  const level = calculateLevel(lifetimeXp, CHARACTER_LEVEL_THRESHOLDS);
  const tierXp = calculateTierXp(lifetimeXp, level, CHARACTER_LEVEL_THRESHOLDS);
  const tierRequired = calculateTierRequired(level, CHARACTER_LEVEL_THRESHOLDS);
  const progress = calculateTierProgress(lifetimeXp, level, CHARACTER_LEVEL_THRESHOLDS);

  return { level, tierXp, tierRequired, progress };
}

/**
 * Normalize a vector level to a 0-100 score for harmony calculation
 * 
 * This normalizes based on the maximum reasonable level (30 is a good target).
 * We use a soft cap approach where reaching level 30 = 100 points,
 * but it doesn't artificially limit higher levels.
 */
export function normalizeVectorScore(vectorLevel: number): number {
  // Cap at a reasonable level (30) for harmony calculation
  // This prevents one vector from dominating if it gets ahead
  const CAP_LEVEL = 30;
  const cappedLevel = Math.min(vectorLevel, CAP_LEVEL);
  const score = (cappedLevel / CAP_LEVEL) * 100;
  return Math.min(100, Math.round(score));
}

/**
 * Calculate tri-vector harmony score
 * 
 * Formula: (min × 0.4) + (avg × 0.6)
 * This rewards balance while still allowing progression.
 */
export function calculateHarmony(
  mindScore: number,
  muscleScore: number,
  moneyScore: number
): number {
  const scores = [mindScore, muscleScore, moneyScore];
  const minScore = Math.min(...scores);
  const avgScore = (mindScore + muscleScore + moneyScore) / 3;

  const harmony =
    minScore * HARMONY_CONFIG.minWeight + avgScore * HARMONY_CONFIG.avgWeight;

  return Math.round(harmony);
}

/**
 * Calculate the complete character progression snapshot
 */
export function calculateProgressionSnapshot(
  mindXp: number,
  muscleXp: number,
  moneyXp: number
): CharacterProgressSnapshot {
  // Calculate vector levels
  const mindLevel = calculateVectorLevel(mindXp);
  const muscleLevel = calculateVectorLevel(muscleXp);
  const moneyLevel = calculateVectorLevel(moneyXp);

  // Calculate lifetime XP and character level
  const lifetimeXp = mindXp + muscleXp + moneyXp;
  const charLevel = calculateCharacterLevel(lifetimeXp);

  // Calculate harmony
  const mindScore = normalizeVectorScore(mindLevel.level);
  const muscleScore = normalizeVectorScore(muscleLevel.level);
  const moneyScore = normalizeVectorScore(moneyLevel.level);
  const harmonyScore = calculateHarmony(mindScore, muscleScore, moneyScore);

  // Determine current and eligible ranks
  const currentRank = determineRank(
    charLevel.level,
    lifetimeXp,
    mindLevel.level,
    muscleLevel.level,
    moneyLevel.level,
    harmonyScore
  );

  const eligibleForRanks = getEligibleRanks(
    charLevel.level,
    lifetimeXp,
    mindLevel.level,
    muscleLevel.level,
    moneyLevel.level,
    harmonyScore
  );

  return {
    lifetimeXp,
    vectorXp: { mind: mindXp, muscle: muscleXp, money: moneyXp },
    characterLevel: charLevel.level,
    characterTierXp: charLevel.tierXp,
    characterTierRequired: charLevel.tierRequired,
    characterTierProgress: charLevel.progress,
    vectorLevels: {
      mind:   { ...mindLevel,   xp: mindXp },
      muscle: { ...muscleLevel, xp: muscleXp },
      money:  { ...moneyLevel,  xp: moneyXp },
    },
    harmonyScore,
    vectorScores: { mind: mindScore, muscle: muscleScore, money: moneyScore },
    currentRank,
    eligibleForRanks,
  };
}

/**
 * Determine the current rank based on progression
 */
export function determineRank(
  characterLevel: number,
  lifetimeXp: number,
  mindLevel: number,
  muscleLevel: number,
  moneyLevel: number,
  harmonyScore: number
): RankConfig {
  // Start with Novice
  let currentRank = RANKS.E;

  // Check each rank in order
  const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'] as const;
  for (const rankCode of rankOrder) {
    const rankConfig = RANKS[rankCode];
    if (meetsRankRequirements(
      characterLevel,
      lifetimeXp,
      mindLevel,
      muscleLevel,
      moneyLevel,
      harmonyScore,
      rankConfig
    )) {
      currentRank = rankConfig;
    } else {
      break;
    }
  }

  return currentRank;
}

/**
 * Check if requirements are met for a specific rank
 */
export function meetsRankRequirements(
  characterLevel: number,
  lifetimeXp: number,
  mindLevel: number,
  muscleLevel: number,
  moneyLevel: number,
  harmonyScore: number,
  rank: RankConfig
): boolean {
  // Check character level
  if (characterLevel < rank.minCharacterLevel) return false;

  // Check lifetime XP
  if (lifetimeXp < rank.minLifetimeXp) return false;

  // Check vector levels
  if (mindLevel < rank.minVectorLevels.mind) return false;
  if (muscleLevel < rank.minVectorLevels.muscle) return false;
  if (moneyLevel < rank.minVectorLevels.money) return false;

  // Check harmony (only for higher ranks, not for Novice/Apprentice)
  if (rank.code !== 'E' && rank.code !== 'D') {
    if (harmonyScore < rank.minHarmonyScore) return false;
  }

  return true;
}

/**
 * Get all ranks the user is eligible for
 */
export function getEligibleRanks(
  characterLevel: number,
  lifetimeXp: number,
  mindLevel: number,
  muscleLevel: number,
  moneyLevel: number,
  harmonyScore: number
): RankConfig[] {
  const eligible: RankConfig[] = [];
  const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'] as const;

  for (const rankCode of rankOrder) {
    const rankConfig = RANKS[rankCode];
    if (
      meetsRankRequirements(
        characterLevel,
        lifetimeXp,
        mindLevel,
        muscleLevel,
        moneyLevel,
        harmonyScore,
        rankConfig
      )
    ) {
      eligible.push(rankConfig);
    }
  }

  return eligible;
}

/**
 * Calculate how close a user is to the next rank
 */
export function calculateRankProgress(
  characterLevel: number,
  lifetimeXp: number,
  mindLevel: number,
  muscleLevel: number,
  moneyLevel: number,
  harmonyScore: number
): {
  currentRank: RankConfig;
  nextRank: RankConfig | null;
  unmetRequirements: string[];
} {
  const currentRank = determineRank(
    characterLevel,
    lifetimeXp,
    mindLevel,
    muscleLevel,
    moneyLevel,
    harmonyScore
  );

  const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'] as const;
  const currentIndex = rankOrder.indexOf(currentRank.code as any);
  const nextRank = currentIndex < rankOrder.length - 1 ? RANKS[rankOrder[currentIndex + 1]] : null;

  const unmetRequirements: string[] = [];

  if (nextRank) {
    if (characterLevel < nextRank.minCharacterLevel) {
      unmetRequirements.push(
        `Character Level: ${characterLevel}/${nextRank.minCharacterLevel}`
      );
    }
    if (lifetimeXp < nextRank.minLifetimeXp) {
      unmetRequirements.push(
        `Lifetime XP: ${lifetimeXp.toLocaleString()}/${nextRank.minLifetimeXp.toLocaleString()}`
      );
    }
    if (mindLevel < nextRank.minVectorLevels.mind) {
      unmetRequirements.push(
        `Mind Level: ${mindLevel}/${nextRank.minVectorLevels.mind}`
      );
    }
    if (muscleLevel < nextRank.minVectorLevels.muscle) {
      unmetRequirements.push(
        `Muscle Level: ${muscleLevel}/${nextRank.minVectorLevels.muscle}`
      );
    }
    if (moneyLevel < nextRank.minVectorLevels.money) {
      unmetRequirements.push(
        `Money Level: ${moneyLevel}/${nextRank.minVectorLevels.money}`
      );
    }
    if (harmonyScore < nextRank.minHarmonyScore) {
      unmetRequirements.push(
        `Harmony: ${harmonyScore}/${nextRank.minHarmonyScore}`
      );
    }
  }

  return { currentRank, nextRank, unmetRequirements };
}

/**
 * Estimate days to level up (rough estimate based on assumed daily XP)
 */
export function estimateDaysToLevelUp(
  currentXp: number,
  level: number,
  avgDailyXp: number = 100,
  thresholds: Record<number, number> = VECTOR_LEVEL_THRESHOLDS
): number {
  if (avgDailyXp <= 0) return Infinity;

  const nextThreshold = thresholds[level + 1] ?? thresholds[30] + 100000;
  const xpNeeded = Math.max(0, nextThreshold - currentXp);
  return Math.ceil(xpNeeded / avgDailyXp);
}
