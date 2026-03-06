-- Migration: 009-fix-permissive-rls
-- Fixes overly permissive 'USING (1=1)' or 'WITH CHECK (1=1)' policies reported by Supabase Security Advisor.

-- 1. api.anonymous_users & public.anonymous_users
DROP POLICY IF EXISTS "Allow anonymous user tracking" ON api.anonymous_users;
CREATE POLICY "Allow anonymous user tracking" ON api.anonymous_users AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (fingerprint IS NOT NULL);

DROP POLICY IF EXISTS "Service and anonymous users can manage tracking" ON public.anonymous_users;
CREATE POLICY "Service and anonymous users can manage tracking" ON public.anonymous_users AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (fingerprint IS NOT NULL);

-- 2. api.firebase_auth_mapping & public.firebase_auth_mapping
DROP POLICY IF EXISTS "Allow auth mapping insertion" ON api.firebase_auth_mapping;
CREATE POLICY "Allow auth mapping insertion" ON api.firebase_auth_mapping AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (supabase_user_id = auth.uid());

DROP POLICY IF EXISTS "Allow auth mapping insertion" ON public.firebase_auth_mapping;
CREATE POLICY "Allow auth mapping insertion" ON public.firebase_auth_mapping AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (supabase_user_id = auth.uid());

-- 3. api.form_submissions & public.form_submissions
DROP POLICY IF EXISTS "Anyone can submit forms" ON api.form_submissions;
CREATE POLICY "Anyone can submit forms" ON api.form_submissions AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (form_id IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can submit forms" ON public.form_submissions;
DROP POLICY IF EXISTS "Anyone can submit to forms" ON public.form_submissions;
CREATE POLICY "Anyone can submit to forms" ON public.form_submissions AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (form_id IS NOT NULL);

-- 4. api.user_tracking & public.user_tracking
DROP POLICY IF EXISTS "Allow tracking data insertion" ON api.user_tracking;
CREATE POLICY "Allow tracking data insertion" ON api.user_tracking AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (fingerprint IS NOT NULL OR firebase_uid IS NOT NULL);

DROP POLICY IF EXISTS "Allow tracking data insertion" ON public.user_tracking;
DROP POLICY IF EXISTS "Service can manage user tracking" ON public.user_tracking;
CREATE POLICY "Allow tracking data insertion" ON public.user_tracking AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (fingerprint IS NOT NULL OR firebase_uid IS NOT NULL);

-- 5. public.forms
DROP POLICY IF EXISTS "Anonymous users can create forms" ON public.forms;
CREATE POLICY "Anonymous users can create forms" ON public.forms AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (user_id IS NOT NULL);
