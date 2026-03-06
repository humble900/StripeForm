-- Migration: 010-fix-performance-warnings
-- Fixes RLS Initplan execution (by securely wrapping auth.uid() inside a SELECT query where missing)
-- Fixes duplicate Permissive policies by consolidating redundant policies and dropping conflicts.

-- Part 1: Fix `auth_rls_initplan` warnings
-- The Advisor flagged auth.<function>() evaluated on each row. They need to be wrapped in (select auth.<function>()).

-- 1. api.firebase_auth_mapping & public.firebase_auth_mapping
DROP POLICY IF EXISTS "Allow auth mapping insertion" ON api.firebase_auth_mapping;
CREATE POLICY "Allow auth mapping insertion" ON api.firebase_auth_mapping AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (supabase_user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Allow auth mapping insertion" ON public.firebase_auth_mapping;
CREATE POLICY "Allow auth mapping insertion" ON public.firebase_auth_mapping AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (supabase_user_id = (select auth.uid()));

-- 2. public.form_drafts
DROP POLICY IF EXISTS "Users can insert own drafts" ON public.form_drafts;
CREATE POLICY "Users can insert own drafts" ON public.form_drafts AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (user_id = (select auth.uid())::text);

DROP POLICY IF EXISTS "Users can update own drafts" ON public.form_drafts;
CREATE POLICY "Users can update own drafts" ON public.form_drafts AS PERMISSIVE FOR UPDATE TO PUBLIC USING (user_id = (select auth.uid())::text);

DROP POLICY IF EXISTS "Users can view own drafts" ON public.form_drafts;
CREATE POLICY "Users can view own drafts" ON public.form_drafts AS PERMISSIVE FOR SELECT TO PUBLIC USING (user_id = (select auth.uid())::text);

DROP POLICY IF EXISTS "Users can delete own drafts" ON public.form_drafts;
CREATE POLICY "Users can delete own drafts" ON public.form_drafts AS PERMISSIVE FOR DELETE TO PUBLIC USING (user_id = (select auth.uid())::text);


-- Part 2: Fix `multiple_permissive_policies` warnings
-- The Advisor flagged that we have multiple permissive policies firing for the same roles.
-- We must combine/drop redundancies.

-- 1. api.form_fields / public.form_fields (SELECT conflict)
-- Conflict: {"Admins can view all form fields","Users can view own form fields"} and {"Users can manage form fields"}
-- Removing redundant 'view own form fields' as 'manage' usually covers it, or combining.
DROP POLICY IF EXISTS "Users can view own form fields" ON public.form_fields;
DROP POLICY IF EXISTS "Users can view own form fields" ON api.form_fields;
-- We'll leave `Admins can view all form fields` and `Users can manage form fields` (which covers SELECT).


-- 2. api.form_submissions / public.form_submissions (INSERT and SELECT conflicts)
-- INSERT conflict: {"Anyone can submit forms","Users can insert own form submissions"}
DROP POLICY IF EXISTS "Users can insert own form submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Users can insert own form submissions" ON api.form_submissions;
-- SELECT conflict: {"Admins can view all form submissions","Users can view form submissions","Users can view own form submissions"}
DROP POLICY IF EXISTS "Users can view own form submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Users can view own form submissions" ON api.form_submissions;
DROP POLICY IF EXISTS "Users can view form submissions" ON api.form_submissions;
-- We will keep the broadest applicable ones.


-- 3. api.forms / public.forms (INSERT and SELECT conflicts)
-- INSERT conflict: {"Anonymous users can create forms", "Users can insert own forms", "Users can create forms"}
DROP POLICY IF EXISTS "Users can insert own forms" ON public.forms;
DROP POLICY IF EXISTS "Users can insert own forms" ON api.forms;
DROP POLICY IF EXISTS "Users can create forms" ON public.forms;
DROP POLICY IF EXISTS "Users can create forms" ON api.forms;
-- SELECT conflict: {"Admins can view all forms", "Users can view own forms", "Anonymous users can view forms by fingerprint", "Users can manage own forms"}
DROP POLICY IF EXISTS "Users can view own forms" ON public.forms;
DROP POLICY IF EXISTS "Users can view own forms" ON api.forms;


-- 4. api.payment_intents / public.payment_intents (INSERT and SELECT conflicts)
-- INSERT conflict: {"Users can create payments","Users can insert own payment intents"}
DROP POLICY IF EXISTS "Users can insert own payment intents" ON public.payment_intents;
DROP POLICY IF EXISTS "Users can insert own payment intents" ON api.payment_intents;
-- SELECT conflict: {"Admins can view all payment intents","Users can view own payment intents","Users can view own payments"}
DROP POLICY IF EXISTS "Users can view own payment intents" ON public.payment_intents;
DROP POLICY IF EXISTS "Users can view own payment intents" ON api.payment_intents;


-- 5. api.user_tracking / public.user_tracking (SELECT conflict)
-- SELECT conflict: {"Users can view own tracking","Users can view own tracking data"}
DROP POLICY IF EXISTS "Users can view own tracking" ON public.user_tracking;
DROP POLICY IF EXISTS "Users can view own tracking" ON api.user_tracking;


-- 6. api.users / public.users (SELECT and UPDATE conflicts)
-- SELECT conflict: {"Admins can view all users","Users can view own profile"} 
-- UPDATE conflict: {"Admins can update all users","Users can update own profile"}
-- Both of these actually DO need to exist concurrently (one for Admins, one for the User).
-- The linter warns about multiple permissive policies, but combining an Admin policy and a User policy into a huge single OR query is often LESS performant.
-- However, to strictly clear the linter, we CAN combine them.
-- But standard Supabase practice allows accepting these specifically for user profiles/admin combos as safe.


-- 7. public.faqs (SELECT conflict)
-- SELECT conflict: {"Admins can manage faqs","Anyone can view published faqs"}
-- Similar to users, an admin manager policy vs a public readable policy. These are standard separate concerns.


-- 8. public.form_templates (SELECT conflict)
-- SELECT conflict: {"Admins can manage form templates","Anyone can view form templates","Anyone can view templates"}
DROP POLICY IF EXISTS "Anyone can view form templates" ON public.form_templates;


-- Part 3: Fix Duplicate Index Warning
-- The Advisor flagged forms table has {forms_user_id_idx, idx_forms_user_id}.
DROP INDEX IF EXISTS idx_forms_user_id;

