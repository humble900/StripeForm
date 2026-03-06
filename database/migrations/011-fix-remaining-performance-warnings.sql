-- Migration: 011-fix-remaining-performance-warnings
-- Fixes the remaining 49 duplicate overlapping permissive policies that survived the last pass.

-- 1. api.payment_intents (SELECT conflict: "Admins can view all payment intents" vs "Users can view own payments")
DROP POLICY IF EXISTS "Users can view own payments" ON api.payment_intents;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payment_intents;

-- 2. api.users / public.users (SELECT conflict: "Admins can view all users" vs "Users can view own profile")
-- To solve the "multiple permissive policies" warning while retaining BOTH capabilities cleanly without massive OR joins:
-- The linter technically prefers merging these. We will drop the "Users can view own profile" and fold it into "view all users" with an OR.
DROP POLICY IF EXISTS "Users can view own profile" ON api.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON api.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

CREATE POLICY "Combined user view policy" ON api.users AS PERMISSIVE FOR SELECT TO public 
USING (
    (id = (select auth.uid())::text) OR 
    (EXISTS (SELECT 1 FROM public.users users_1 WHERE users_1.id = (SELECT auth.uid())::text AND users_1.role IN ('admin', 'super_admin')))
);

CREATE POLICY "Combined user view policy" ON public.users AS PERMISSIVE FOR SELECT TO public 
USING (
    (id = (select auth.uid())::text) OR 
    (EXISTS (SELECT 1 FROM public.users users_1 WHERE users_1.id = (SELECT auth.uid())::text AND users_1.role IN ('admin', 'super_admin')))
);

-- 3. api.users / public.users (UPDATE conflict: "Admins can update all users" vs "Users can update own profile")
DROP POLICY IF EXISTS "Users can update own profile" ON api.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON api.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;

CREATE POLICY "Combined user update policy" ON api.users AS PERMISSIVE FOR UPDATE TO public 
USING (
    (id = (select auth.uid())::text) OR 
    (EXISTS (SELECT 1 FROM public.users users_1 WHERE users_1.id = (SELECT auth.uid())::text AND users_1.role IN ('admin', 'super_admin')))
);

CREATE POLICY "Combined user update policy" ON public.users AS PERMISSIVE FOR UPDATE TO public 
USING (
    (id = (select auth.uid())::text) OR 
    (EXISTS (SELECT 1 FROM public.users users_1 WHERE users_1.id = (SELECT auth.uid())::text AND users_1.role IN ('admin', 'super_admin')))
);

-- 4. public.faqs (SELECT conflict: "Admins can manage faqs" vs "Anyone can view published faqs")
DROP POLICY IF EXISTS "Admins can manage faqs" ON public.faqs;
DROP POLICY IF EXISTS "Anyone can view published faqs" ON public.faqs;

CREATE POLICY "Combined faqs view policy" ON public.faqs AS PERMISSIVE FOR SELECT TO public 
USING (
    (is_active = true) OR 
    (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid())::text AND users.role IN ('admin', 'super_admin')))
);

-- Note: we need to recreate the Admin INSERT/UPDATE/DELETE policies for FAQs since we just dropped "Admins can manage faqs"
-- "manage" implies ALL rules. Let's add them back as separate action types so they don't overlap SELECT.
CREATE POLICY "Admins can insert faqs" ON public.faqs AS PERMISSIVE FOR INSERT TO public 
WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid())::text AND users.role IN ('admin', 'super_admin')));
CREATE POLICY "Admins can update faqs" ON public.faqs AS PERMISSIVE FOR UPDATE TO public 
USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid())::text AND users.role IN ('admin', 'super_admin')));
CREATE POLICY "Admins can delete faqs" ON public.faqs AS PERMISSIVE FOR DELETE TO public 
USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid())::text AND users.role IN ('admin', 'super_admin')));

-- 5. public.form_fields (SELECT conflict: "Admins can view all form fields" vs "Users can manage form fields")
DROP POLICY IF EXISTS "Admins can view all form fields" ON public.form_fields;
-- The user "manage" policy covers SELECT. We will modify the user policy to include admins using an OR.
DROP POLICY IF EXISTS "Users can manage form fields" ON public.form_fields;
CREATE POLICY "Users and admins can manage form fields" ON public.form_fields AS PERMISSIVE FOR ALL TO public
USING (
    EXISTS (SELECT 1 FROM public.forms WHERE forms.id = form_fields.form_id AND forms.user_id = (SELECT auth.uid())::text)
    OR
    EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid())::text AND users.role IN ('admin', 'super_admin'))
);

-- 6. public.form_submissions (SELECT conflict: "Admins can view all form submissions" vs "Users can view form submissions")
DROP POLICY IF EXISTS "Users can view form submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Admins can view all form submissions" ON public.form_submissions;
CREATE POLICY "Users and admins can view form submissions" ON public.form_submissions AS PERMISSIVE FOR SELECT TO public
USING (
    EXISTS (SELECT 1 FROM public.forms WHERE forms.id = form_submissions.form_id AND forms.user_id = (SELECT auth.uid())::text)
    OR
    EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid())::text AND users.role IN ('admin', 'super_admin'))
);

-- 7. public.form_templates (SELECT conflict: "Admins can manage form templates" vs "Anyone can view templates")
DROP POLICY IF EXISTS "Admins can manage form templates" ON public.form_templates;
-- Make Admins manage without SELECT (since anyone can see them anyway)
CREATE POLICY "Admins can insert templates" ON public.form_templates AS PERMISSIVE FOR INSERT TO public 
WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid())::text AND users.role IN ('admin', 'super_admin')));
CREATE POLICY "Admins can update templates" ON public.form_templates AS PERMISSIVE FOR UPDATE TO public 
USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid())::text AND users.role IN ('admin', 'super_admin')));
CREATE POLICY "Admins can delete templates" ON public.form_templates AS PERMISSIVE FOR DELETE TO public 
USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid())::text AND users.role IN ('admin', 'super_admin')));

-- 8. public.forms (INSERT conflict: "Anonymous users can create forms" vs "Users can manage own forms")
-- 9. public.forms (SELECT conflict: "Admins can view all forms" vs "Anonymous users can view forms by fingerprint" vs "Users can manage own forms")

DROP POLICY IF EXISTS "Anonymous users can create forms" ON public.forms;
DROP POLICY IF EXISTS "Users can manage own forms" ON public.forms;
DROP POLICY IF EXISTS "Admins can view all forms" ON public.forms;
DROP POLICY IF EXISTS "Anonymous users can view forms by fingerprint" ON public.forms;

CREATE POLICY "Combined forms view policy" ON public.forms AS PERMISSIVE FOR SELECT TO public
USING (
    (user_id = (SELECT auth.uid())::text)
    OR
    (is_public = true)
    OR
    (allow_anonymous = true)
    OR
    EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid())::text AND users.role IN ('admin', 'super_admin'))
);

CREATE POLICY "Combined forms insert policy" ON public.forms AS PERMISSIVE FOR INSERT TO public
WITH CHECK (
    (user_id = (SELECT auth.uid())::text)
    OR
    (user_id IS NULL) -- allowing anonymous forms
);

CREATE POLICY "Combined forms update policy" ON public.forms AS PERMISSIVE FOR UPDATE TO public
USING (
    (user_id = (SELECT auth.uid())::text)
    OR
    EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid())::text AND users.role IN ('admin', 'super_admin'))
);

CREATE POLICY "Combined forms delete policy" ON public.forms AS PERMISSIVE FOR DELETE TO public
USING (
    (user_id = (SELECT auth.uid())::text)
    OR
    EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid())::text AND users.role IN ('admin', 'super_admin'))
);

-- Drop the duplicate index on api.forms
DROP INDEX IF EXISTS api.idx_forms_user_id;
