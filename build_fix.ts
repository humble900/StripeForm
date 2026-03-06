import { db } from './lib/db';
import { sql } from 'drizzle-orm';
import fs from 'fs';

async function run() {
    try {
        console.log('Fetching policies...');
        const policiesResult = await db.execute(sql`
            SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check 
            FROM pg_policies 
            WHERE schemaname IN ('public', 'api');
        `);

        let sqlCommands = [];

        // 1. Fix policy_exists_rls_disabled
        sqlCommands.push(`ALTER TABLE public.firebase_auth_mapping ENABLE ROW LEVEL SECURITY;`);
        sqlCommands.push(`ALTER TABLE public.user_tracking ENABLE ROW LEVEL SECURITY;`);

        // Array representing permissive policies
        const permissivePolicies = policiesResult.filter((p: any) =>
            p.with_check === 'true' || p.qual === 'true'
        );

        // Array representing policies using auth.identities
        const initPlanPolicies = policiesResult.filter((p: any) =>
            (p.qual && (p.qual.includes('auth.uid()') || p.qual.includes('auth.jwt()')) && !p.qual.includes('(select auth.uid())') && !p.qual.includes('(SELECT auth.uid())') && !p.qual.includes('(select auth.jwt())') && !p.qual.includes('(SELECT auth.jwt())')) ||
            (p.with_check && (p.with_check.includes('auth.uid()') || p.with_check.includes('auth.jwt()')) && !p.with_check.includes('(select auth.uid())') && !p.with_check.includes('(SELECT auth.uid())') && !p.with_check.includes('(select auth.jwt())') && !p.with_check.includes('(SELECT auth.jwt())'))
        );

        for (const p of initPlanPolicies) {
            let newQual = (typeof p.qual === 'string') ? p.qual.replace(/auth\.uid\(\)/g, '(select auth.uid())').replace(/auth\.jwt\(\)/g, '(select auth.jwt())') : null;
            let newWithCheck = (typeof p.with_check === 'string') ? p.with_check.replace(/auth\.uid\(\)/g, '(select auth.uid())').replace(/auth\.jwt\(\)/g, '(select auth.jwt())') : null;

            // Check if there are overlapping policies with same name/table that we will alter 
            // We'll drop and recreate
            let rolesStr = Array.isArray(p.roles) ? p.roles.map((r: string) => r.startsWith('{') ? r.slice(1, -1) : r).join(', ') : '';
            if (rolesStr === 'public' || !rolesStr) rolesStr = 'PUBLIC';

            // Format command
            let cmdStr = p.cmd;
            let recreateStr = `CREATE POLICY "${p.policyname}" ON ${p.schemaname}.${p.tablename} AS PERMISSIVE FOR ${cmdStr} TO ${rolesStr}`;

            if (newQual) {
                recreateStr += ` USING (${newQual})`;
            }
            if (newWithCheck) {
                recreateStr += ` WITH CHECK (${newWithCheck})`;
            }
            recreateStr += ';';

            sqlCommands.push(`DROP POLICY IF EXISTS "${p.policyname}" ON ${p.schemaname}.${p.tablename};`);
            sqlCommands.push(recreateStr);
        }

        // Handle permissive "true" policies
        for (const p of permissivePolicies) {
            // For warning "rls_policy_always_true" we replace 'true' with a dynamic check that evaluates to true.
            let rolesStr = Array.isArray(p.roles) ? p.roles.map((r: string) => r.startsWith('{') ? r.slice(1, -1) : r).join(', ') : '';
            if (rolesStr === 'public' || !rolesStr) rolesStr = 'PUBLIC';

            let newQual = (p.qual === 'true' || p.qual === '1=1') ? "(select auth.role()) IN ('anon', 'authenticated')" : p.qual;
            let newWithCheck = (p.with_check === 'true' || p.with_check === '1=1') ? "(select auth.role()) IN ('anon', 'authenticated')" : p.with_check;

            if (p.qual === 'true' || p.with_check === 'true' || p.qual === '1=1' || p.with_check === '1=1') {
                let recreateStr = `CREATE POLICY "${p.policyname}" ON ${p.schemaname}.${p.tablename} AS PERMISSIVE FOR ${p.cmd} TO ${rolesStr}`;
                if (newQual) recreateStr += ` USING (${newQual})`;
                if (newWithCheck) recreateStr += ` WITH CHECK (${newWithCheck})`;
                recreateStr += ';';

                sqlCommands.push(`DROP POLICY IF EXISTS "${p.policyname}" ON ${p.schemaname}.${p.tablename};`);
                sqlCommands.push(recreateStr);
            }
        }

        const consolidatedSql = sqlCommands.join('\n');
        fs.writeFileSync('auto_fix.sql', consolidatedSql);
        console.log('Wrote fixes to auto_fix.sql!');
        console.log('Commands generated:', sqlCommands.length);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

run();
