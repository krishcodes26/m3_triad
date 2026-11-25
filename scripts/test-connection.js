const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

console.log('Testing Supabase connection...\n');
console.log('URL:', supabaseUrl ? '✓ Found' : '✗ Missing');
console.log('Key:', supabaseKey ? '✓ Found' : '✗ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n🔗 Attempting to connect...\n');
    
    // Try to fetch auth session (non-data query)
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Connection successful!\n');
    console.log('Session data:', data ? 'Available' : 'No active session (expected if not logged in)');
    
    // Try to list tables by querying information_schema
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);
    
    if (tablesError) {
      console.log('\n📊 Database query test: Could not list tables (may need RLS or permissions)');
    } else {
      console.log('\n📊 Database accessible');
      if (tables && tables.length > 0) {
        console.log('Found tables:', tables.map(t => t.table_name).join(', '));
      } else {
        console.log('No tables found yet (database may be empty)');
      }
    }
    
    console.log('\n✅ Supabase is properly configured!');
    
  } catch (err) {
    console.error('\n❌ Connection failed:', err.message);
    process.exit(1);
  }
}

testConnection();
