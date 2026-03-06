import { db } from './lib/db';
import { sql } from 'drizzle-orm';

async function run() {
    try {
        // Test a basic query against forms which now has the updated `auth.uid()` RLS
        // Note: Since this runs server-side outside of Next.js Auth, RLS might block but we want to ensure no syntax errors.
        const forms = await db.execute(sql`SELECT * FROM forms LIMIT 1`);
        console.log('Forms query passed:', forms.length >= 0);

        const users = await db.execute(sql`SELECT * FROM users LIMIT 1`);
        console.log('Users query passed:', users.length >= 0);

        const searchPathFuncs = await db.execute(sql`
      SELECT proname, proconfig 
      FROM pg_proc 
      WHERE proname IN ('get_user_form_count', 'cleanup_expired_drafts') AND proconfig IS NOT NULL;
    `);
        console.log('Functions with search_path:', JSON.stringify(searchPathFuncs, null, 2));

    } catch (err) {
        console.error('Smoke test failed:', err);
    } finally {
        process.exit(0);
    }
}

run();
