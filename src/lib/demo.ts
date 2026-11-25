/**
 * Local demo mode.
 *
 * The demo account is used for design inspection, so it must work even when the
 * hosted Supabase project has no usable demo user (or cannot deliver the
 * confirmation email that sign-up requires). Instead of failing the whole
 * "Quick Access" button we fall back to a local session that never touches the
 * network. Demo data lives in the browser (see `src/lib/demo/quests.ts`).
 *
 * The flag is stored in localStorage so a refresh keeps the user inside the
 * demo, and cleared as soon as a real Supabase session appears.
 */

import type { Session } from '@supabase/supabase-js';

const STORAGE_KEY = 'm3triad:demo-mode';

/** Fixed id so the same demo rows are reused across reloads. */
export const DEMO_USER_ID = '00000000-0000-4000-8000-000000000001';

const DEMO_DISPLAY_NAME = 'Demo User';
const DEMO_EMAIL = 'demo@m3triad.dev';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function isDemoMode(): boolean {
  if (!isBrowser()) return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function enableDemoMode(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* storage blocked (private mode) — demo still works for this page view */
  }
}

export function disableDemoMode(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * A Session-shaped object for the local demo user. It is never sent to
 * Supabase — `providers.tsx` swaps it in for the real session while demo mode
 * is on, so every page that reads `session.user` keeps working.
 */
export function getDemoSession(): Session {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const iso = new Date().toISOString();

  return {
    access_token: 'demo-access-token',
    token_type: 'bearer',
    expires_in: 60 * 60 * 24 * 365,
    expires_at: nowSeconds + 60 * 60 * 24 * 365,
    refresh_token: 'demo-refresh-token',
    user: {
      id: DEMO_USER_ID,
      aud: 'authenticated',
      role: 'authenticated',
      email: DEMO_EMAIL,
      email_confirmed_at: iso,
      phone: '',
      confirmed_at: iso,
      last_sign_in_at: iso,
      app_metadata: { provider: 'demo', providers: ['demo'] },
      user_metadata: { full_name: DEMO_DISPLAY_NAME, demo: true },
      identities: [],
      created_at: iso,
      updated_at: iso,
      is_anonymous: false,
    },
  } as unknown as Session;
}
