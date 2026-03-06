-- 1. Enable RLS on tables where policies exist but RLS is disabled
ALTER TABLE public.anonymous_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.firebase_auth_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.user_tracking ENABLE ROW LEVEL SECURITY;

-- 2. Fix Mutable Search Paths for Security Definer Functions
CREATE OR REPLACE FUNCTION public.get_user_form_count(target_user_id text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 set search_path = ''
AS $function$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER 
        FROM public.forms 
        WHERE user_id = target_user_id
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_anonymous_form_count(fingerprint text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 set search_path = ''
AS $function$
BEGIN
    RETURN (
        SELECT COALESCE(form_count, 0)::INTEGER 
        FROM public.anonymous_users 
        WHERE device_fingerprint = fingerprint
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_drafts()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 set search_path = ''
AS $function$
BEGIN
    DELETE FROM public.form_drafts 
    WHERE expires_at < NOW();
    
    -- Log cleanup activity
    INSERT INTO public.system_analytics (date, metric, value, metadata)
    VALUES (NOW(), 'drafts_cleaned_up', 
            (SELECT COUNT(*) FROM public.form_drafts WHERE expires_at < NOW()),
            '{"cleanup_type": "expired_drafts"}');
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_form_drafts_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 set search_path = ''
AS $function$
BEGIN
    NEW.updated_at = NOW();
    NEW.last_accessed_at = NOW();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_form_drafts_last_accessed()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 set search_path = ''
AS $function$
BEGIN
    UPDATE public.form_drafts 
    SET last_accessed_at = NOW() 
    WHERE id = NEW.id;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.convert_anonymous_to_authenticated(fingerprint_text text, user_id_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 set search_path = ''
AS $function$
DECLARE
    rows_affected INTEGER := 0;
BEGIN
    -- Validate inputs
    IF fingerprint_text IS NULL OR trim(fingerprint_text) = '' THEN
        RAISE EXCEPTION 'Fingerprint cannot be null or empty';
    END IF;

    IF user_id_uuid IS NULL THEN
        RAISE EXCEPTION 'User ID cannot be null';
    END IF;

    -- Update user_tracking
    UPDATE public.user_tracking 
    SET 
        user_id = user_id_uuid,
        is_anonymous = false,
        updated_at = NOW()
    WHERE fingerprint = fingerprint_text;
    
    -- Update anonymous_users
    UPDATE public.anonymous_users 
    SET 
        converted_to_user_id = user_id_uuid,
        converted_at = NOW(),
        updated_at = NOW()
    WHERE fingerprint = fingerprint_text;
    
    -- Get total rows affected
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    
    -- Log the conversion
    IF rows_affected > 0 THEN
        RAISE NOTICE 'Successfully converted anonymous user with fingerprint: %', fingerprint_text;
        RETURN TRUE;
    ELSE
        RAISE NOTICE 'No records found to convert for fingerprint: %', fingerprint_text;
        RETURN FALSE;
    END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_visit_count(fingerprint_text text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 set search_path = ''
AS $function$
BEGIN
    UPDATE api.user_tracking 
    SET visit_count = visit_count + 1,
        last_visit = NOW(),
        updated_at = NOW()
    WHERE fingerprint = fingerprint_text;
END;
$function$;

-- 3. Optimize RLS Initplans (replace auth.uid() with (SELECT auth.uid()))
-- Drop the slow policies
DROP POLICY IF EXISTS "Admins can view all form fields" ON public.form_fields;
DROP POLICY IF EXISTS "Users can insert own form fields" ON public.form_fields;
DROP POLICY IF EXISTS "Users can manage form fields" ON public.form_fields;
DROP POLICY IF EXISTS "Users can update own form fields" ON public.form_fields;
DROP POLICY IF EXISTS "Users can view form fields" ON public.form_fields;
DROP POLICY IF EXISTS "Users can view own form fields" ON public.form_fields;

CREATE POLICY "Admins can view all form fields" ON public.form_fields
FOR SELECT TO public USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = (SELECT auth.uid())::text AND role IN ('admin', 'super_admin')
    )
);
CREATE POLICY "Users can manage form fields" ON public.form_fields
FOR ALL TO public USING (
    form_id IN (
        SELECT forms.id FROM public.forms
        WHERE forms.user_id = (SELECT auth.uid())::text
    )
);

DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

CREATE POLICY "Admins can update all users" ON public.users FOR UPDATE TO public USING (EXISTS (SELECT 1 FROM public.users users_1 WHERE users_1.id = (SELECT auth.uid())::text AND users_1.role IN ('admin', 'super_admin')));
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT TO public USING (EXISTS (SELECT 1 FROM public.users users_1 WHERE users_1.id = (SELECT auth.uid())::text AND users_1.role IN ('admin', 'super_admin')));
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE TO public USING (id = (SELECT auth.uid())::text);
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT TO public USING (id = (SELECT auth.uid())::text);

DROP POLICY IF EXISTS "Users can insert own profile details" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can manage own profile data" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile details" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile data" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile details" ON public.user_profiles;

CREATE POLICY "Users can manage own profile data" ON public.user_profiles FOR ALL TO public USING (user_id = (SELECT auth.uid())::text);

DROP POLICY IF EXISTS "Admins can view analytics" ON public.system_analytics;
CREATE POLICY "Admins can view analytics" ON public.system_analytics FOR SELECT TO public USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid())::text AND users.role IN ('admin', 'super_admin')));

DROP POLICY IF EXISTS "Admins can manage all form templates" ON public.form_templates;
DROP POLICY IF EXISTS "Admins can manage templates" ON public.form_templates;
CREATE POLICY "Admins can manage form templates" ON public.form_templates FOR ALL TO public USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid())::text AND users.role IN ('admin', 'super_admin')));

DROP POLICY IF EXISTS "Admins can view all forms" ON public.forms;
DROP POLICY IF EXISTS "Users can create forms" ON public.forms;
DROP POLICY IF EXISTS "Users can delete own forms" ON public.forms;
DROP POLICY IF EXISTS "Users can insert own forms" ON public.forms;
DROP POLICY IF EXISTS "Users can update own forms" ON public.forms;
DROP POLICY IF EXISTS "Users can view own forms" ON public.forms;

CREATE POLICY "Admins can view all forms" ON public.forms FOR SELECT TO public USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid())::text AND users.role IN ('admin', 'super_admin')));
CREATE POLICY "Users can manage own forms" ON public.forms FOR ALL TO public USING (user_id = (SELECT auth.uid())::text);

DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
CREATE POLICY "Users can manage own tickets" ON public.support_tickets FOR ALL TO public USING (user_id = (SELECT auth.uid())::text);

DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL TO public USING (user_id = (SELECT auth.uid())::text);

DROP POLICY IF EXISTS "Admins can manage faqs" ON public.faqs;
CREATE POLICY "Admins can manage faqs" ON public.faqs FOR ALL TO public USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid())::text AND users.role IN ('admin', 'super_admin')));

DROP POLICY IF EXISTS "Admins can view all form submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Users can view form submissions" ON public.form_submissions;
CREATE POLICY "Admins can view all form submissions" ON public.form_submissions FOR SELECT TO public USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid())::text AND users.role IN ('admin', 'super_admin')));
CREATE POLICY "Users can view form submissions" ON public.form_submissions FOR SELECT TO public USING (
    user_id = (SELECT auth.uid())::text OR form_id IN (
        SELECT forms.id FROM public.forms WHERE forms.user_id = (SELECT auth.uid())::text
    )
);

-- 4. Consolidate Multiple Permissive Policies
DROP POLICY IF EXISTS "Allow anonymous user tracking" ON public.anonymous_users;
DROP POLICY IF EXISTS "Service can manage anonymous users" ON public.anonymous_users;
CREATE POLICY "Service and anonymous users can manage tracking" ON public.anonymous_users FOR ALL TO public USING (true);
