/**
 * One-time script to provision the demo account for design inspection.
 *
 * Run with: node scripts/create-demo-account.js
 *
 * Reads .env.local. Creating or resetting the hosted account needs a
 * service-role key: sign-up through the anon key requires a confirmation email,
 * which a demo mailbox can never receive.
 *
 *   SUPABASE_SERVICE_ROLE_KEY=...   (Supabase dashboard → Project Settings → API)
 *
 * Without the key the script still signs in with an existing demo account and
 * seeds it, or explains what to do. The app itself also has a local demo
 * fallback, so "Quick Access (Demo Account)" works either way.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zdvqqsoijmixjhaqrugi.supabase.co';
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_wz3effX0tHbqhxcKetjbQA_WYcSkA-v';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const DEMO_EMAIL = process.env.DEMO_EMAIL || 'demo@m3triad.dev';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'Demo@12345!';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Create the demo user (or reset an existing one) with a confirmed email so
 * password sign-in works immediately. Returns the user id, or null when no
 * service-role key is configured.
 */
async function ensureDemoUser() {
  if (!SERVICE_ROLE_KEY) return null;

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Look for an existing demo user first.
  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      console.warn('⚠️  Could not list users:', error.message);
      return null;
    }
    const users = data?.users ?? [];
    const existing = users.find(u => (u.email || '').toLowerCase() === DEMO_EMAIL.toLowerCase());
    if (existing) {
      const { error: resetError } = await admin.auth.admin.updateUserById(existing.id, {
        password: DEMO_PASSWORD,
        email_confirm: true,
      });
      if (resetError) {
        console.warn('⚠️  Could not reset the demo user:', resetError.message);
        return null;
      }
      console.log('✅ Existing demo account reset (password + confirmed email)');
      return existing.id;
    }
    if (users.length < 200) break;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: 'Demo User' },
  });
  if (error || !data?.user) {
    console.warn('⚠️  Could not create the demo user:', error?.message ?? 'unknown error');
    return null;
  }
  console.log('✅ Demo account created with a confirmed email');
  return data.user.id;
}

async function seedProfile(userId) {
  // User profile
  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId,
      display_name: 'Demo User',
      timezone: 'UTC',
      locale: 'en-US',
      privacy_mode: false,
    }, { onConflict: 'user_id' });
  if (profileError) console.warn('⚠️  Profile upsert:', profileError.message);
  else console.log('✅ user_profiles row ready');

  // Character progress
  const { error: charError } = await supabase
    .from('character_progress')
    .upsert({ user_id: userId, level: 7, rank: 'Warrior', total_xp: 3200 }, { onConflict: 'user_id' });
  if (charError) console.warn('⚠️  character_progress upsert:', charError.message);
  else console.log('✅ character_progress row ready');

  // Vector progress
  const vectors = [
    { user_id: userId, vector: 'mind',   level: 5, xp: 1200 },
    { user_id: userId, vector: 'money',  level: 6, xp: 1800 },
    { user_id: userId, vector: 'muscle', level: 4, xp: 950  },
  ];
  for (const v of vectors) {
    const { error } = await supabase
      .from('vector_progress')
      .upsert(v, { onConflict: 'user_id,vector' });
    if (error) console.warn(`⚠️  vector_progress (${v.vector}):`, error.message);
    else console.log(`✅ vector_progress (${v.vector}) ready`);
  }

  // Sample missions (only if none exist)
  const { data: existing } = await supabase
    .from('missions')
    .select('id')
    .eq('user_id', userId);

  if (!existing || existing.length === 0) {
    const missions = [
      { user_id: userId, title: 'Master TypeScript',   vector: 'mind',   status: 'active',   completion_rule: 'task_count' },
      { user_id: userId, title: 'Build SaaS Revenue',  vector: 'money',  status: 'active',   completion_rule: 'task_count' },
      { user_id: userId, title: 'Complete 60-Day Cut', vector: 'muscle', status: 'active',   completion_rule: 'task_count' },
      { user_id: userId, title: 'Read 12 Books',       vector: 'mind',   status: 'complete', completion_rule: 'task_count' },
    ];
    const { error: missionError } = await supabase.from('missions').insert(missions);
    if (missionError) console.warn('⚠️  missions insert:', missionError.message);
    else console.log('✅ missions seeded (4 entries)');
  } else {
    console.log('ℹ️  missions already exist — skipping seed');
  }
}

async function main() {
  console.log('Preparing the demo account…');
  const adminUserId = await ensureDemoUser();

  console.log('Attempting sign-in with demo credentials…');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });

  const userId = signInData?.user?.id ?? adminUserId ?? null;

  if (!signInError && signInData?.user) {
    console.log('✅ Demo account ready — signed in OK');
  } else {
    console.log('Sign-in failed:', signInError?.message);
    if (!userId) {
      console.error('\n❌ No demo account and no service-role key configured.');
      console.log('   Add SUPABASE_SERVICE_ROLE_KEY to .env.local and re-run:');
      console.log('   Supabase dashboard → Project Settings → API → service_role key');
      console.log('   (The app\'s "Quick Access (Demo Account)" button has a local demo fallback meanwhile.)');
      process.exit(1);
    }
  }

  await seedProfile(userId);
  printSummary();
}

function printSummary() {
  console.log('\n🎉 Demo account ready!');
  console.log('   Email:    ', DEMO_EMAIL);
  console.log('   Password: ', DEMO_PASSWORD);
  console.log('\n   Open http://localhost:3000/auth/login');
  console.log('   Click "🔍 Quick Access (Demo Account)" to jump straight in.');
}

main();
