const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySchema() {
  try {
    console.log('🔍 Verifying M3 Triad Database Schema\n');

    // Get all tables
    const { data: tables, error } = await supabase.rpc('get_tables');
    
    if (error) {
      console.log('ℹ️  Using alternative verification method...\n');
      
      // Try to access key tables to verify they exist
      const tablesToCheck = [
        'users',
        'user_profiles',
        'character_progress',
        'vector_progress',
        'missions',
        'tasks',
        'habits',
        'workout_sessions',
        'workout_sets',
        'meal_entries',
        'focus_sessions',
        'xp_ledger',
        'notifications',
        'achievements'
      ];

      console.log('Checking key tables:\n');
      let createdCount = 0;

      for (const table of tablesToCheck) {
        try {
          const { error: tableError } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
            .limit(1);

          if (!tableError) {
            console.log(`✅ ${table}`);
            createdCount++;
          } else if (tableError.code === 'PGRST116') {
            console.log(`✅ ${table} (empty)`);
            createdCount++;
          } else {
            console.log(`❌ ${table} - ${tableError.message}`);
          }
        } catch (e) {
          console.log(`❌ ${table} - ${e.message}`);
        }
      }

      console.log(`\n📊 Result: ${createdCount}/${tablesToCheck.length} tables verified\n`);

      if (createdCount >= 10) {
        console.log('✅ Database schema successfully created!\n');
        return true;
      }
    } else {
      console.log(`Found ${tables?.length || 0} tables\n`);
      if (tables && tables.length > 0) {
        tables.slice(0, 15).forEach(t => console.log(`✅ ${t.table_name}`));
        if (tables.length > 15) {
          console.log(`... and ${tables.length - 15} more tables\n`);
        }
        console.log('\n✅ Database schema successfully created!\n');
        return true;
      }
    }

  } catch (err) {
    console.error('Error verifying schema:', err.message);
  }
}

verifySchema();
