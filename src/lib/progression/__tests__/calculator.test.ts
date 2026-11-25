/**
 * Progression Calculator Tests
 * 
 * Demonstrates the progression calculation logic and verifies correctness.
 */

import {
  calculateVectorLevel,
  calculateCharacterLevel,
  normalizeVectorScore,
  calculateHarmony,
  calculateProgressionSnapshot,
  determineRank,
  meetsRankRequirements,
} from '../calculator';
import { RANKS } from '../config';

/**
 * Example: User with balanced progression
 * - Mind: 15,000 XP (Level 20)
 * - Muscle: 14,500 XP (Level 20)
 * - Money: 15,500 XP (Level 21)
 * - Lifetime: 45,000 XP (Character Level 23)
 */
describe('Progression Calculator - Balanced Character', () => {
  const mindXp = 15000;
  const muscleXp = 14500;
  const moneyXp = 15500;

  it('should calculate vector levels correctly', () => {
    const mind = calculateVectorLevel(mindXp);
    const muscle = calculateVectorLevel(muscleXp);
    const money = calculateVectorLevel(moneyXp);

    expect(mind.level).toBe(20);
    expect(muscle.level).toBe(20);
    expect(money.level).toBe(21);
  });

  it('should calculate character level from lifetime XP', () => {
    const lifetime = mindXp + muscleXp + moneyXp;
    const charLevel = calculateCharacterLevel(lifetime);

    expect(charLevel.level).toBe(23);
    expect(charLevel.progress).toBeGreaterThan(0);
    expect(charLevel.progress).toBeLessThanOrEqual(100);
  });

  it('should calculate harmony score for balanced vectors', () => {
    const mind = calculateVectorLevel(mindXp);
    const muscle = calculateVectorLevel(muscleXp);
    const money = calculateVectorLevel(moneyXp);

    const mindScore = normalizeVectorScore(mind.level);
    const muscleScore = normalizeVectorScore(muscle.level);
    const moneyScore = normalizeVectorScore(money.level);

    const harmony = calculateHarmony(mindScore, muscleScore, moneyScore);

    // For a balanced character, harmony should be high (>80)
    expect(harmony).toBeGreaterThan(80);
  });

  it('should determine rank correctly', () => {
    const snapshot = calculateProgressionSnapshot(mindXp, muscleXp, moneyXp);

    // With level 23 and balanced vectors, should be Warrior (C) or Elite (B)
    expect(snapshot.currentRank.code).toMatch(/^[CB]$/);
  });
});

/**
 * Example: User with skewed progression (Mind-heavy)
 * - Mind: 50,000 XP (Level 30)
 * - Muscle: 5,000 XP (Level 7)
 * - Money: 5,000 XP (Level 7)
 * - Lifetime: 60,000 XP (Character Level 20+)
 * 
 * This tests the harmony penalty for unbalanced progression
 */
describe('Progression Calculator - Unbalanced Character', () => {
  const mindXp = 50000;
  const muscleXp = 5000;
  const moneyXp = 5000;

  it('should show low harmony for unbalanced vectors', () => {
    const snapshot = calculateProgressionSnapshot(mindXp, muscleXp, moneyXp);

    // Despite high lifetime XP, harmony should be much lower
    expect(snapshot.harmonyScore).toBeLessThan(50);
  });

  it('should restrict rank eligibility based on harmony', () => {
    const snapshot = calculateProgressionSnapshot(mindXp, muscleXp, moneyXp);

    // Even with high lifetime XP, rank eligibility should be limited
    // because harmony gates higher ranks
    expect(snapshot.eligibleForRanks.length).toBeLessThan(5);
  });
});

/**
 * Example: Beginner character
 * - All vectors at Level 1
 * - Should be Novice (E) rank
 */
describe('Progression Calculator - Novice Character', () => {
  it('should recognize Novice rank correctly', () => {
    const snapshot = calculateProgressionSnapshot(0, 0, 0);

    expect(snapshot.characterLevel).toBe(1);
    expect(snapshot.vectorLevels.mind.level).toBe(1);
    expect(snapshot.vectorLevels.muscle.level).toBe(1);
    expect(snapshot.vectorLevels.money.level).toBe(1);
    expect(snapshot.currentRank.code).toBe('E');
    expect(snapshot.currentRank.name).toBe('Novice');
  });
});

/**
 * Example: Progression from Warrior to Elite
 */
describe('Progression Calculator - Rank Transitions', () => {
  it('should identify path to Elite rank', () => {
    // Warrior requirements: Lvl 20, 100k lifetime XP, Lvl 15+ in each vector
    const mindXp = 25000;    // Level 22
    const muscleXp = 25000;  // Level 22
    const moneyXp = 25000;   // Level 22
    const lifetime = mindXp + muscleXp + moneyXp; // 75,000 total

    // Current state: should be Warrior (C)
    const currentSnapshot = calculateProgressionSnapshot(mindXp, muscleXp, moneyXp);
    expect(currentSnapshot.currentRank.code).toBe('C');

    // After gaining more XP to reach Elite requirements
    const advancedMindXp = 60000;    // Level 29
    const advancedMuscleXp = 60000;  // Level 29
    const advancedMoneyXp = 60000;   // Level 29

    const advancedSnapshot = calculateProgressionSnapshot(
      advancedMindXp,
      advancedMuscleXp,
      advancedMoneyXp
    );

    // Should be Elite (B) if harmony is sufficient
    expect(advancedSnapshot.eligibleForRanks.map(r => r.code)).toContain('B');
  });
});

/**
 * Example: Tier progress within a level
 */
describe('Progression Calculator - Tier Progress', () => {
  it('should correctly calculate progress within a level', () => {
    // Level 15 requires 25,200 XP, Level 16 requires 28,500 XP
    // So tier range is 3,300 XP
    // Halfway: 25,200 + 1,650 = 26,850 XP

    const halfway = 26850;
    const level = calculateVectorLevel(halfway);

    expect(level.level).toBe(15);
    expect(level.tierXp).toBeGreaterThan(1600);
    expect(level.tierXp).toBeLessThan(1700);
    expect(level.progress).toBeGreaterThan(45);
    expect(level.progress).toBeLessThan(55);
  });
});

/**
 * Example: Rank requirement verification
 */
describe('Progression Calculator - Rank Requirements', () => {
  it('should verify Elite rank requirements', () => {
    const elite = RANKS.B;

    // Does meet requirements
    expect(
      meetsRankRequirements(
        30,      // charLevel
        65000,   // lifetime XP
        25,      // mind
        25,      // muscle
        25,      // money
        75,      // harmony
        elite
      )
    ).toBe(true);

    // Fails character level
    expect(
      meetsRankRequirements(
        29,      // Too low
        65000,
        25,
        25,
        25,
        75,
        elite
      )
    ).toBe(false);

    // Fails harmony
    expect(
      meetsRankRequirements(
        30,
        65000,
        25,
        25,
        25,
        70,      // Too low for Elite
        elite
      )
    ).toBe(false);
  });
});

/**
 * Integration test: Complete character progression snapshot
 */
describe('Progression Calculator - Complete Snapshot', () => {
  it('should produce a valid complete snapshot', () => {
    const snapshot = calculateProgressionSnapshot(10000, 8000, 9500);

    // Basic structure validation
    expect(snapshot).toHaveProperty('lifetimeXp');
    expect(snapshot).toHaveProperty('characterLevel');
    expect(snapshot).toHaveProperty('vectorLevels');
    expect(snapshot).toHaveProperty('harmonyScore');
    expect(snapshot).toHaveProperty('currentRank');
    expect(snapshot).toHaveProperty('eligibleForRanks');

    // Value validation
    expect(snapshot.lifetimeXp).toBe(27500);
    expect(snapshot.characterLevel).toBeGreaterThan(0);
    expect(snapshot.harmonyScore).toBeGreaterThanOrEqual(0);
    expect(snapshot.harmonyScore).toBeLessThanOrEqual(100);
    expect(snapshot.currentRank).toBeDefined();
    expect(snapshot.eligibleForRanks.length).toBeGreaterThan(0);
  });
});

/**
 * Edge cases
 */
describe('Progression Calculator - Edge Cases', () => {
  it('should handle zero XP correctly', () => {
    const snapshot = calculateProgressionSnapshot(0, 0, 0);
    expect(snapshot.characterLevel).toBe(1);
    expect(snapshot.characterTierProgress).toBe(0);
  });

  it('should handle very high XP values', () => {
    const snapshot = calculateProgressionSnapshot(999999, 999999, 999999);
    expect(snapshot.characterLevel).toBeGreaterThan(30);
    expect(snapshot.vectorLevels.mind.level).toBeGreaterThan(30);
  });

  it('should normalize vector scores to 0-100 range', () => {
    const score1 = normalizeVectorScore(1);
    const score30 = normalizeVectorScore(30);
    const score50 = normalizeVectorScore(50);

    expect(score1).toBeGreaterThanOrEqual(0);
    expect(score1).toBeLessThanOrEqual(100);
    expect(score30).toBe(100);
    expect(score50).toBe(100); // Capped at level 30
  });
});
