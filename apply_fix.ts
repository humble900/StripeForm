import { db } from './lib/db';
import { sql } from 'drizzle-orm';
import fs from 'fs';

async function run() {
    try {
        console.log('Reading auto_fix.sql...');
        const sqlContent = fs.readFileSync('auto_fix.sql', 'utf8');

        console.log('Executing fixes...');
        // Execute raw SQL block
        await db.execute(sql.raw(sqlContent));

        console.log('Successfully applied all RLS fixes to the database!');
    } catch (err) {
        console.error('Failed to apply fixes:', err);
    } finally {
        process.exit(0);
    }
}

run();
