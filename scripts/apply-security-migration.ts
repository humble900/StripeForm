import { readFileSync } from 'fs';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
    console.error("No DATABASE_URL found in .env");
    process.exit(1);
}

const sqlContent = readFileSync('database/migrations/013-fix-remaining-unindexed-fks.sql', 'utf8');

const sql = postgres(url, { max: 1, ssl: 'require' });

async function run() {
    console.log("Applying security migration...");
    try {
        // The postgres library .unsafe allows multi-statement execution.
        await sql.unsafe(sqlContent);
        console.log("Migration applied successfully!");
    } catch (error) {
        console.error("Error applying migration:", error);
        process.exit(1);
    } finally {
        await sql.end();
    }
}

run();
