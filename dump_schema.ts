import { db } from './lib/db';
import { sql } from 'drizzle-orm';
import fs from 'fs';

async function run() {
    try {
        const policiesResult = await db.execute(sql`
      SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check 
      FROM pg_policies 
      WHERE schemaname IN ('public', 'api');
    `);

        const functionsResult = await db.execute(sql`
      SELECT n.nspname as schema, p.proname as name, pg_get_function_identity_arguments(p.oid) as args, pg_get_functiondef(p.oid) as def 
      FROM pg_proc p 
      JOIN pg_namespace n ON p.pronamespace = n.oid 
      WHERE n.nspname IN ('public', 'api');
    `);

        fs.writeFileSync('supabase_policies.json', JSON.stringify(policiesResult, null, 2));
        fs.writeFileSync('supabase_functions.json', JSON.stringify(functionsResult, null, 2));
        console.log('Done writing files.');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

run();
