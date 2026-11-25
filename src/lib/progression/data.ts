/**
 * M3 Triad Progression Data Service
 * 
 * Fetches raw progression data from Supabase and calculates derived values.
 */

import { supabase } from '@/lib/supabase';
import { calculateProgressionSnapshot, type CharacterProgressSnapshot } from './calculator';

/**
 * Fetch all progression data for a user
 */
export async function getUserProgressionData(userId: string) {
  try {
    // Fetch vector progress for all three vectors
    const { data: vectorProgressData, error: vectorError } = await supabase
      .from('vector_progress')
      .select('*')
      .eq('user_id', userId);

    if (vectorError) {
      console.error('Error fetching vector progress:', vectorError);
      return null;
    }

    if (!vectorProgressData || vectorProgressData.length === 0) {
      console.log('No vector progress found for user, initializing...');
      return null;
    }

    // Extract XP for each vector
    const mindData = vectorProgressData.find(v => v.vector === 'mind');
    const muscleData = vectorProgressData.find(v => v.vector === 'muscle');
    const moneyData = vectorProgressData.find(v => v.vector === 'money');

    const mindXp = mindData?.xp ?? 0;
    const muscleXp = muscleData?.xp ?? 0;
    const moneyXp = moneyData?.xp ?? 0;

    // Calculate complete progression snapshot
    const snapshot = calculateProgressionSnapshot(mindXp, muscleXp, moneyXp);

    return snapshot;
  } catch (error) {
    console.error('Error in getUserProgressionData:', error);
    return null;
  }
}

/**
 * Get a summary of recent XP activities
 */
export async function getRecentXpActivities(userId: string, limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('xp_ledger')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching XP activities:', error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error('Error in getRecentXpActivities:', error);
    return [];
  }
}

/**
 * Get total XP earned today for a user
 */
export async function getTodayXpTotal(userId: string): Promise<{ mind: number; muscle: number; money: number; total: number }> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.toISOString();

    const { data, error } = await supabase
      .from('xp_ledger')
      .select('vector, amount')
      .eq('user_id', userId)
      .gte('created_at', todayStart)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching today XP:', error);
      return { mind: 0, muscle: 0, money: 0, total: 0 };
    }

    const totals = {
      mind: 0,
      muscle: 0,
      money: 0,
      total: 0,
    };

    if (data) {
      for (const entry of data) {
        totals[entry.vector as 'mind' | 'muscle' | 'money'] += entry.amount;
        totals.total += entry.amount;
      }
    }

    return totals;
  } catch (error) {
    console.error('Error in getTodayXpTotal:', error);
    return { mind: 0, muscle: 0, money: 0, total: 0 };
  }
}

/**
 * Initialize vector progress for a new user
 */
export async function initializeUserVectorProgress(userId: string) {
  try {
    // Initialize all three vectors with 0 XP and Level 1
    const { data, error } = await supabase
      .from('vector_progress')
      .insert([
        { user_id: userId, vector: 'mind', xp: 0, level: 1 },
        { user_id: userId, vector: 'muscle', xp: 0, level: 1 },
        { user_id: userId, vector: 'money', xp: 0, level: 1 },
      ])
      .select();

    if (error) {
      console.error('Error initializing vector progress:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in initializeUserVectorProgress:', error);
    return null;
  }
}

/**
 * Get habit completion data for today
 */
export async function getTodayHabitCompletions(userId: string) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('habit_check_ins')
      .select('id, status, habit:habits(id, name, vector)')
      .eq('habit.user_id', userId)
      .eq('scheduled_date', today);

    if (error) {
      console.error('Error fetching today habit completions:', error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error('Error in getTodayHabitCompletions:', error);
    return [];
  }
}

/**
 * Get recent focus sessions
 */
export async function getRecentFocusSessions(userId: string, limit: number = 5) {
  try {
    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching focus sessions:', error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error('Error in getRecentFocusSessions:', error);
    return [];
  }
}

/**
 * Get recent workout sessions
 */
export async function getRecentWorkoutSessions(userId: string, limit: number = 5) {
  try {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'active')
      .order('start_time', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching workout sessions:', error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error('Error in getRecentWorkoutSessions:', error);
    return [];
  }
}

/**
 * Get today's nutrition summary
 */
export async function getTodayNutritionSummary(userId: string) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('meal_entries')
      .select('protein_g, calories')
      .eq('user_id', userId)
      .eq('entry_date', today);

    if (error) {
      console.error('Error fetching nutrition data:', error);
      return { totalProtein: 0, totalCalories: 0, mealCount: 0 };
    }

    let totalProtein = 0;
    let totalCalories = 0;

    if (data) {
      totalProtein = data.reduce((sum, meal) => sum + (meal.protein_g ?? 0), 0);
      totalCalories = data.reduce((sum, meal) => sum + (meal.calories ?? 0), 0);
    }

    return {
      totalProtein: Math.round(totalProtein),
      totalCalories: Math.round(totalCalories),
      mealCount: data?.length ?? 0,
    };
  } catch (error) {
    console.error('Error in getTodayNutritionSummary:', error);
    return { totalProtein: 0, totalCalories: 0, mealCount: 0 };
  }
}
