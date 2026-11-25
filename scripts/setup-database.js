const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('🚀 M3 Triad Database Setup\n');
    console.log('Reading migration file...\n');

    const migrationPath = path.join(__dirname, 'migrations', '001_create_m3_triad_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('⚠️  IMPORTANT: To run the SQL migration, you need to:\n');
    console.log('1. Go to your Supabase dashboard: https://app.supabase.com');
    console.log('2. Select your "M3-Triad" project');
    console.log('3. Go to "SQL Editor" in the left sidebar');
    console.log('4. Click "New Query"');
    console.log('5. Copy and paste the SQL from migrations/001_create_m3_triad_schema.sql');
    console.log('6. Click "Run" to execute\n');
    console.log('═'.repeat(70));
    console.log('\nSQL MIGRATION PREVIEW:\n');
    console.log(sql.split('\n').slice(0, 30).join('\n'));
    console.log('\n... (truncated)\n');
    console.log('═'.repeat(70));
    console.log('\n✅ Migration file is ready at: migrations/001_create_m3_triad_schema.sql\n');
    console.log('After you run the SQL migration in Supabase, reply "done" and I will:\n');
    console.log('  - Verify the tables were created');
    console.log('  - Generate TypeScript types');
    console.log('  - Set up RLS (Row Level Security) policies\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

setupDatabase();
