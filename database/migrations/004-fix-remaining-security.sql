-- Fix Remaining Security Issues
-- This script addresses the remaining Supabase advisor warnings

-- 1. Fix remaining function search path issues
-- The convert_anonymous_to_authenticated and increment_visit_count functions
-- still have mutable search_path, let's fix them

-- Drop and recreate convert_anonymous_to_authenticated with proper search_path
DROP FUNCTION IF EXISTS public.convert_anonymous_to_authenticated(TEXT, TEXT);
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

-- Drop and recreate increment_visit_count with proper search_path
DROP FUNCTION IF EXISTS public.increment_visit_count(TEXT, TEXT, TEXT);
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

-- 2. Grant execute permissions on the fixed functions
GRANT EXECUTE ON FUNCTION public.convert_anonymous_to_authenticated(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_visit_count(TEXT, TEXT, TEXT) TO anon, authenticated;

-- 3. Verify all functions have proper search_path
SELECT 
    'Function Search Path Check' as check_type,
    proname as function_name,
    prosrc as has_search_path_set
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname IN (
    'get_user_form_count',
    'get_anonymous_form_count', 
    'is_admin',
    'get_admin_users',
    'update_updated_at_column',
    'get_supabase_user_id',
    'convert_anonymous_to_authenticated',
    'increment_visit_count'
)
ORDER BY proname;

-- Success message
SELECT 'Remaining security issues fixed successfully!' as status;


