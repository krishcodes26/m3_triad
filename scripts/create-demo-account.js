/**
 * One-time script to create the demo account for design inspection.
 * Run with: node create-demo-account.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zdvqqsoijmixjhaqrugi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_wz3effX0tHbqhxcKetjbQA_WYcSkA-v';

const DEMO_EMAIL    = 'demo@m3triad.dev';
const DEMO_PASSWORD = 'Demo@12345!';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
  // Try sign-in first (account may already exist from prior runs)
  console.log('Attempting sign-in with demo credentials…');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });

  if (!signInError && signInData?.user) {
    console.log('✅ Demo account already exists — signed in OK');
    await seedProfile(signInData.user.id);
    printSummary();
    return;
  }

  // Sign-in failed — try creating the account
  console.log('Sign-in failed:', signInError?.message);
  console.log('Attempting sign-up…');

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    options: { data: { full_name: 'Demo User' } },
  });

  if (signUpError) {
    console.error('❌ Sign-up also failed:', signUpError.message);
    console.log('\n👉 Create the account manually in the Supabase dashboard:');
    console.log('   https://supabase.com/dashboard → Authentication → Users → Invite user');
    console.log('   Email:', DEMO_EMAIL, '  Password:', DEMO_PASSWORD);
    process.exit(1);
  }

  const userId = signUpData.user?.id;
  if (!userId) {
    console.error('❌ No user ID returned from sign-up — email confirmation may be required.');
    console.log('\n👉 Disable "Confirm email" in Supabase Auth settings, then re-run this script.');
    process.exit(1);
  }

  console.log('✅ Account created (uid:', userId + ')');
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
