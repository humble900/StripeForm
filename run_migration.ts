import { db } from './lib/db';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function run() {
    try {
        const sqlContent = fs.readFileSync(path.join(process.cwd(), 'database/migrations/0000_supabase_advisories.sql'), 'utf-8');

        // Split by statement if needed, or run as one giant block
        await db.execute(sql.raw(sqlContent));

        console.log('Successfully applied Supabase advisories migration.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit(0);
    }
}

run();
