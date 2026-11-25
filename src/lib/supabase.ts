// Supabase client utilities for M3 Triad
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Support both naming conventions
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// ============================================================================
// AUTH — OTP FLOW
// ============================================================================

// Register: creates account and triggers OTP email
export async function signUp(email: string, password: string, fullName?: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      // emailRedirectTo not needed — we handle OTP manually
    },
  });
}

// Login: password sign-in then triggers OTP via email
export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

// Send a fresh OTP to the email (for resend)
export async function sendOtp(email: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });
}

// Verify the 6-digit OTP the user typed
export async function verifyOtp(email: string, token: string, type: 'signup' | 'email') {
  return supabase.auth.verifyOtp({ email, token, type });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
}

export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ============================================================================
// USER PROFILE UTILITIES
// ============================================================================

export async function getUserProfile(userId: string) {
  return supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
}

export async function checkUserProfileExists(userId: string) {
  const { data } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  return { exists: !!data };
}

export async function createUserProfile(
  userId: string,
  profile: { display_name?: string; avatar_url?: string; timezone?: string; locale?: string }
) {
  return supabase
    .from('user_profiles')
    .insert({
      user_id: userId,
      display_name: profile.display_name ?? null,
      avatar_url: profile.avatar_url ?? null,
      timezone: profile.timezone ?? 'UTC',
      locale: profile.locale ?? 'en-US',
      privacy_mode: true,
    })
    .select()
    .single();
}

export async function updateUserProfile(
  userId: string,
  profile: Partial<{
    display_name: string;
    avatar_url: string;
    bio: string;
    timezone: string;
    locale: string;
    privacy_mode: boolean;
  }>
) {
  return supabase
    .from('user_profiles')
    .update(profile)
    .eq('user_id', userId)
    .select()
    .single();
}

// ============================================================================
// CHARACTER & PROGRESSION
// ============================================================================

export async function getCharacterProgress(userId: string) {
  return supabase.from('character_progress').select('*').eq('user_id', userId).single();
}

export async function createCharacterProgress(userId: string) {
  return supabase
    .from('character_progress')
    .insert({ user_id: userId, level: 1, rank: 'Novice', total_xp: 0 })
    .select()
    .single();
}

export async function getVectorProgress(userId: string) {
  return supabase.from('vector_progress').select('*').eq('user_id', userId);
}

export async function initializeVectorProgress(userId: string) {
  return supabase
    .from('vector_progress')
    .insert(
      (['mind', 'money', 'muscle'] as const).map((vector) => ({
        user_id: userId,
        vector,
        level: 1,
        xp: 0,
      }))
    )
    .select();
}

// ============================================================================
// MISSIONS
// ============================================================================

export async function getMissions(userId: string) {
  return supabase
    .from('missions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

export async function createMission(
  userId: string,
  mission: {
    title: string;
    description?: string;
    vector: 'mind' | 'money' | 'muscle';
    goal?: string;
    start_date?: string;
    deadline?: string;
    status?: string;
  }
) {
  return supabase
    .from('missions')
    .insert({
      user_id: userId,
      title: mission.title,
      description: mission.description ?? null,
      vector: mission.vector,
      goal: mission.goal ?? null,
      start_date: mission.start_date ?? null,
      deadline: mission.deadline ?? null,
      status: (mission.status as any) ?? 'draft',
      completion_rule: 'task_count',
    })
    .select()
    .single();
}
