/**
 * Verify Supabase Database Setup
 * 
 * This script checks if the database is properly configured and contains sample data.
 * Run with: npm run verify-db
 */

// Load environment variables FIRST before any other imports
import { config } from 'dotenv';
import { join } from 'path';

// Load .env.local from the widget-marketplace directory
config({ path: join(__dirname, '..', '.env.local') });

// Now import supabase client after env vars are loaded
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables.');
  console.error('   Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local\n');
  console.error('📖 Setup instructions: widget-marketplace/supabase/README.md');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

interface VerificationResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

type VerificationCheck = () => Promise<VerificationResult>;

/**
 * Helper to safely execute verification checks
 */
async function runCheck(check: VerificationCheck): Promise<VerificationResult> {
  try {
    return await check();
  } catch (error) {
    return {
      step: 'Unknown',
      status: 'error',
      message: 'Unexpected error during verification',
      details: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Check 1: Verify database connection
 */
async function checkConnection(): Promise<VerificationResult> {
  const { error } = await supabase.from('widgets').select('count', { count: 'exact', head: true });
  
  if (error) {
    return {
      step: 'Connection',
      status: 'error',
      message: 'Failed to connect to Supabase',
      details: error.message
    };
  }
  
  return {
    step: 'Connection',
    status: 'success',
    message: 'Successfully connected to Supabase'
  };
}

/**
 * Check 2: Verify widgets table exists
 */
async function checkTableSchema(): Promise<VerificationResult> {
  const { error } = await supabase
    .from('widgets')
    .select('id')
    .limit(1);

  if (error) {
    return {
      step: 'Table Schema',
      status: 'error',
      message: 'widgets table does not exist or is not accessible',
      details: error.message
    };
  }
  
  return {
    step: 'Table Schema',
    status: 'success',
    message: 'widgets table exists and is accessible'
  };
}

/**
 * Check 3: Verify sample data exists
 */
async function checkSampleData(): Promise<VerificationResult> {
  const { data, error, count } = await supabase
    .from('widgets')
    .select('widget_id, display_name', { count: 'exact' });

  if (error) {
    return {
      step: 'Sample Data',
      status: 'error',
      message: 'Failed to query sample data',
      details: error.message
    };
  }
  
  if (!data || data.length === 0) {
    return {
      step: 'Sample Data',
      status: 'warning',
      message: 'No widgets found in database. Run the seed migration (002_seed_sample_widgets.sql)',
      details: 'Expected at least 8 sample widgets'
    };
  }
  
  return {
    step: 'Sample Data',
    status: 'success',
    message: `Found ${count} widget(s) in database`,
    details: data.map(w => `${w.display_name} (${w.widget_id})`).join(', ')
  };
}

/**
 * Check 4: Verify required columns exist
 */
async function checkColumnSchema(): Promise<VerificationResult> {
  const { error } = await supabase
    .from('widgets')
    .select('id, widget_id, name, display_name, version, downloads, permissions, sizes, created_at, updated_at')
    .limit(1);

  if (error) {
    return {
      step: 'Column Schema',
      status: 'error',
      message: 'Some required columns are missing',
      details: error.message
    };
  }
  
  return {
    step: 'Column Schema',
    status: 'success',
    message: 'All required columns are present'
  };
}

/**
 * Check 5: Verify indexes are working
 */
async function checkIndexes(): Promise<VerificationResult> {
  const { error } = await supabase
    .from('widgets')
    .select('widget_id')
    .eq('widget_id', 'clock-widget')
    .maybeSingle();

  // PGRST116 = no rows returned, which is fine for index check
  if (error && error.code !== 'PGRST116') {
    return {
      step: 'Indexes',
      status: 'warning',
      message: 'Could not verify indexes',
      details: error.message
    };
  }
  
  return {
    step: 'Indexes',
    status: 'success',
    message: 'Indexes appear to be working (widget_id lookup successful)'
  };
}

async function verifyDatabase(): Promise<void> {
  console.log('🔍 Verifying Supabase Database Setup...\n');

  // Run connection check first - if it fails, no point continuing
  const connectionResult = await runCheck(checkConnection);
  
  if (connectionResult.status === 'error') {
    printResults([connectionResult]);
    console.log('\n💡 Tip: Check your .env.local file and ensure Supabase credentials are correct.');
    process.exit(1);
  }

  // Run remaining checks
  const results: VerificationResult[] = [
    connectionResult,
    await runCheck(checkTableSchema),
    await runCheck(checkSampleData),
    await runCheck(checkColumnSchema),
    await runCheck(checkIndexes)
  ];

  printResults(results);
}

/**
 * Print verification results and exit with appropriate code
 */
function printResults(results: VerificationResult[]): void {
  console.log('📊 Verification Results:\n');
  
  let hasErrors = false;
  let hasWarnings = false;

  results.forEach(result => {
    const icon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${result.step}: ${result.message}`);
    
    if (result.details) {
      console.log(`   Details: ${result.details}`);
    }
    console.log('');

    if (result.status === 'error') hasErrors = true;
    if (result.status === 'warning') hasWarnings = true;
  });

  // Summary
  console.log('━'.repeat(60));
  if (hasErrors) {
    console.log('❌ Database setup has errors. Please check the issues above.');
    console.log('\n📖 Setup instructions: widget-marketplace/supabase/README.md');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  Database setup has warnings. Everything should work, but check the warnings above.');
    process.exit(0);
  } else {
    console.log('✅ Database setup is complete and working correctly!');
    console.log('\n🚀 You can now run: npm run dev');
    process.exit(0);
  }
}

// Run verification
verifyDatabase().catch(error => {
  console.error('❌ Unexpected error during verification:', error);
  process.exit(1);
});
