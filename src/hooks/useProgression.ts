/**
 * useProgression Hook
 * 
 * Custom React hook for fetching and managing progression data.
 * Handles loading and error states automatically.
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { getUserProgressionData, getTodayXpTotal } from '@/lib/progression/data';
import type { CharacterProgressSnapshot } from '@/lib/progression/calculator';

export interface ProgressionData {
  snapshot: CharacterProgressSnapshot | null;
  todayXp: { mind: number; muscle: number; money: number; total: number };
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage character progression data
 */
export function useProgression(userId: string | null): ProgressionData {
  const [snapshot, setSnapshot] = useState<CharacterProgressSnapshot | null>(null);
  const [todayXp, setTodayXp] = useState({ mind: 0, muscle: 0, money: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch progression snapshot
      const progressionData = await getUserProgressionData(userId);
      if (progressionData) {
        setSnapshot(progressionData);
      }

      // Fetch today's XP
      const todayData = await getTodayXpTotal(userId);
      setTodayXp(todayData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();

    // Optionally set up a refresh interval
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    snapshot,
    todayXp,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook to get formatted progression display text
 */
export function useProgressionDisplay(snapshot: CharacterProgressSnapshot | null) {
  return {
    characterLevel: snapshot?.characterLevel ?? 1,
    characterLevelRange: snapshot ? `${snapshot.characterLevel} / ${snapshot.characterLevel + 1}` : '1 / 2',
    currentRank: snapshot?.currentRank.name ?? 'Novice',
    currentRankCode: snapshot?.currentRank.code ?? 'E',
    lifetimeXp: snapshot?.lifetimeXp ?? 0,
    harmonyScore: snapshot?.harmonyScore ?? 0,
    tierProgress: snapshot?.characterTierProgress ?? 0,
  };
}
