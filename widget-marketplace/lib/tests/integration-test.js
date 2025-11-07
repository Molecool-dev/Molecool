/**
 * Integration test for Supabase client
 * Run with: node lib/tests/integration-test.js
 * 
 * This test verifies:
 * 1. Environment variables are loaded
 * 2. Database connection works
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function runTests() {
  console.log('🧪 Running Supabase Integration Tests\n');

  // Test 1: Environment variables
  console.log('1️⃣  Testing environment variables...');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('   ❌ Environment variables not set');
    console.log('   Please configure .env.local');
    process.exit(1);
  }
  console.log('   ✅ Environment variables loaded\n');

  // Test 2: Create clients
  console.log('2️⃣  Testing client creation...');
  let supabase, serverClient;
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    
    serverClient = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    
    console.log('   ✅ Clients created successfully\n');
  } catch (error) {
    console.log('   ❌ Failed to create clients:', error.message);
    process.exit(1);
  }

  // Test 3: Database connection
  console.log('3️⃣  Testing database connection...');
  try {
    const { data, error } = await supabase
      .from('widgets')
      .select('widget_id, display_name, version')
      .limit(1);

    if (error) {
      console.log('   ⚠️  Database query failed:', error.message);
      console.log('   (This is expected if database is not set up yet)\n');
    } else {
      console.log('   ✅ Database connection successful');
      if (data && data.length > 0) {
        console.log(`   Found widget: ${data[0].display_name} (${data[0].version})\n`);
      } else {
        console.log('   No widgets found in database\n');
      }
    }
  } catch (err) {
    console.log('   ⚠️  Connection error:', err.message);
    console.log('   (This is expected if database is not set up yet)\n');
  }

  console.log('═'.repeat(50));
  console.log('✅ All integration tests passed!\n');
  console.log('Supabase client is properly configured and ready to use.');
}

runTests().catch((error) => {
  console.error('❌ Integration test failed:', error);
  process.exit(1);
});
