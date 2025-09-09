-- Fix RLS and Security Issues - FIXED VERSION
-- This script addresses the Supabase advisor warnings and errors

-- 1. Enable RLS on tables that have policies but RLS disabled
DO $$
BEGIN
    -- Enable RLS on users table
    IF EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'users' 
        AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND relrowsecurity = false
    ) THEN
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on users table';
    END IF;

    -- Enable RLS on user_profiles table
    IF EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'user_profiles' 
        AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND relrowsecurity = false
    ) THEN
        ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on user_profiles table';
    END IF;

    -- Enable RLS on form_fields table
    IF EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'form_fields' 
        AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND relrowsecurity = false
    ) THEN
        ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on form_fields table';
    END IF;

    -- Enable RLS on form_templates table
    IF EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'form_templates' 
        AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND relrowsecurity = false
    ) THEN
        ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on form_templates table';
    END IF;
END; $$;

-- 2. Fix function search paths for security
-- Recreate functions with proper search_path settings

-- Fix get_user_form_count function
DROP FUNCTION IF EXISTS public.get_user_form_count(TEXT);
CREATE OR REPLACE FUNCTION public.get_user_form_count(target_user_id TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER 
        FROM public.forms 
        WHERE user_id = target_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix get_anonymous_form_count function
DROP FUNCTION IF EXISTS public.get_anonymous_form_count(TEXT);
CREATE OR REPLACE FUNCTION public.get_anonymous_form_count(fingerprint TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COALESCE(form_count, 0)::INTEGER 
        FROM public.anonymous_users 
        WHERE device_fingerprint = fingerprint
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix is_admin function
DROP FUNCTION IF EXISTS public.is_admin(TEXT);
CREATE OR REPLACE FUNCTION public.is_admin(user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE public.users.id = user_id 
        AND public.users.role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix get_admin_users function
DROP FUNCTION IF EXISTS public.get_admin_users();
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (
    id TEXT,
    email TEXT,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.role,
        u.created_at
    FROM public.users u
    WHERE u.role IN ('admin', 'super_admin')
    ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Fix other functions that might have search_path issues
-- Drop triggers that depend on update_updated_at_column function
-- Note: Triggers might be in api schema, so we'll drop from both schemas
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON api.users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON api.user_profiles;
DROP TRIGGER IF EXISTS update_forms_updated_at ON public.forms;
DROP TRIGGER IF EXISTS update_forms_updated_at ON api.forms;
DROP TRIGGER IF EXISTS update_form_fields_updated_at ON public.form_fields;
DROP TRIGGER IF EXISTS update_form_fields_updated_at ON api.form_fields;
DROP TRIGGER IF EXISTS update_form_submissions_updated_at ON public.form_submissions;
DROP TRIGGER IF EXISTS update_form_submissions_updated_at ON api.form_submissions;
DROP TRIGGER IF EXISTS update_anonymous_users_updated_at ON public.anonymous_users;
DROP TRIGGER IF EXISTS update_anonymous_users_updated_at ON api.anonymous_users;
DROP TRIGGER IF EXISTS update_payment_intents_updated_at ON public.payment_intents;
DROP TRIGGER IF EXISTS update_payment_intents_updated_at ON api.payment_intents;
DROP TRIGGER IF EXISTS update_form_templates_updated_at ON public.form_templates;
DROP TRIGGER IF EXISTS update_form_templates_updated_at ON api.form_templates;

-- Now drop the function
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate the function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forms_updated_at
    BEFORE UPDATE ON public.forms
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_form_fields_updated_at
    BEFORE UPDATE ON public.form_fields
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_form_submissions_updated_at
    BEFORE UPDATE ON public.form_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_anonymous_users_updated_at
    BEFORE UPDATE ON public.anonymous_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_intents_updated_at
    BEFORE UPDATE ON public.payment_intents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_form_templates_updated_at
    BEFORE UPDATE ON public.form_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Check if get_supabase_user_id exists and fix it
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'get_supabase_user_id' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        DROP FUNCTION IF EXISTS public.get_supabase_user_id(TEXT);
        RAISE NOTICE 'Dropped get_supabase_user_id function';
    END IF;
END; $$;

-- Recreate get_supabase_user_id function
CREATE OR REPLACE FUNCTION public.get_supabase_user_id(firebase_uid TEXT)
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT supabase_uuid 
        FROM public.firebase_auth_mapping 
        WHERE firebase_uid = get_supabase_user_id.firebase_uid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Check if convert_anonymous_to_authenticated exists and fix it
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'convert_anonymous_to_authenticated' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        DROP FUNCTION IF EXISTS public.convert_anonymous_to_authenticated(TEXT, TEXT);
        RAISE NOTICE 'Dropped convert_anonymous_to_authenticated function';
    END IF;
END; $$;

-- Recreate convert_anonymous_to_authenticated function
CREATE OR REPLACE FUNCTION public.convert_anonymous_to_authenticated(
    fingerprint TEXT,
    firebase_uid TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update anonymous_users table
    UPDATE public.anonymous_users 
    SET firebase_uid = convert_anonymous_to_authenticated.firebase_uid,
        updated_at = NOW()
    WHERE device_fingerprint = convert_anonymous_to_authenticated.fingerprint;
    
    -- Update user_tracking table
    UPDATE public.user_tracking 
    SET firebase_uid = convert_anonymous_to_authenticated.firebase_uid,
        updated_at = NOW()
    WHERE device_fingerprint = convert_anonymous_to_authenticated.fingerprint;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Check if increment_visit_count exists and fix it
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'increment_visit_count' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        DROP FUNCTION IF EXISTS public.increment_visit_count(TEXT, TEXT, TEXT);
        RAISE NOTICE 'Dropped increment_visit_count function';
    END IF;
END; $$;

-- Recreate increment_visit_count function
CREATE OR REPLACE FUNCTION public.increment_visit_count(
    fingerprint TEXT,
    ip_address TEXT,
    user_agent TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.user_tracking (
        device_fingerprint,
        ip_address,
        user_agent,
        last_visit,
        visit_count
    ) VALUES (
        increment_visit_count.fingerprint,
        increment_visit_count.ip_address,
        increment_visit_count.user_agent,
        NOW(),
        1
    )
    ON CONFLICT (device_fingerprint) 
    DO UPDATE SET
        last_visit = NOW(),
        visit_count = user_tracking.visit_count + 1,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Grant execute permissions on fixed functions
GRANT EXECUTE ON FUNCTION public.get_user_form_count(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_anonymous_form_count(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated;

-- 5. Verify RLS is enabled on all tables with policies
DO $$
DECLARE
    table_name TEXT;
    rls_enabled BOOLEAN;
BEGIN
    FOR table_name IN 
        SELECT unnest(ARRAY['users', 'user_profiles', 'form_fields', 'form_templates', 'forms', 'form_submissions', 'payment_intents', 'anonymous_users'])
    LOOP
        SELECT relrowsecurity INTO rls_enabled
        FROM pg_class 
        WHERE relname = table_name 
        AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
        
        IF rls_enabled THEN
            RAISE NOTICE 'RLS is enabled on % table', table_name;
        ELSE
            RAISE WARNING 'RLS is NOT enabled on % table', table_name;
        END IF;
    END LOOP;
END; $$;

-- Success message
SELECT 'RLS and security issues fixed successfully!' as status;