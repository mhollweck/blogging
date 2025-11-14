// Script to run migration 005 using Supabase client
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read Supabase credentials from Wrangler secrets or environment
// For now, we'll need to set these manually or read from wrangler config
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fgpkdibwpkphfbbettqr.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable not set');
  console.error('Usage: SUPABASE_SERVICE_KEY=your-key node run-migration-005.js');
  process.exit(1);
}

async function runMigration() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  console.log('🚀 Running migration 005: Blog Detection Schema...');
  console.log(`📍 Database: ${SUPABASE_URL}`);

  // Read the migration SQL file
  const sql = fs.readFileSync('./database/migrations/005_blog_detection.sql', 'utf8');

  // Split by semicolons and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📝 Found ${statements.length} SQL statements to execute`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`\n[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 60)}...`);

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

      if (error) {
        // If exec_sql doesn't exist, try direct query
        console.log('  Trying direct query...');
        const { error: queryError } = await supabase.from('_').select(statement);

        if (queryError) {
          console.error(`  ❌ Error: ${queryError.message}`);
          // Continue with other statements
        } else {
          console.log('  ✅ Success');
        }
      } else {
        console.log('  ✅ Success');
      }
    } catch (err) {
      console.error(`  ❌ Error: ${err.message}`);
    }
  }

  console.log('\n✨ Migration 005 completed!');
  console.log('\nNote: Some statements may have failed if columns/indexes already exist.');
  console.log('Please verify the schema manually in Supabase dashboard if needed.');
}

runMigration().catch(console.error);
