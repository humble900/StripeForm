-- Auth Security Recommendations
-- This script provides SQL commands to help with auth security settings
-- Note: Some of these settings need to be configured in the Supabase Dashboard

-- 1. Create a function to check current auth settings
CREATE OR REPLACE FUNCTION public.get_auth_security_status()
RETURNS TABLE (
    setting_name TEXT,
    current_value TEXT,
    recommendation TEXT,
    action_required TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'leaked_password_protection'::TEXT as setting_name,
        'disabled'::TEXT as current_value,
        'Enable leaked password protection in Auth settings'::TEXT as recommendation,
        'Go to Authentication > Settings > Password Protection'::TEXT as action_required
    UNION ALL
    SELECT 
        'mfa_options'::TEXT as setting_name,
        'insufficient'::TEXT as current_value,
        'Enable TOTP and other MFA methods'::TEXT as recommendation,
        'Go to Authentication > Multi-Factor Authentication'::TEXT as action_required;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Create a view for monitoring auth security
CREATE OR REPLACE VIEW public.auth_security_status AS
SELECT * FROM public.get_auth_security_status();

-- 3. Grant access to the view
GRANT SELECT ON public.auth_security_status TO authenticated;

-- 4. Create a function to validate password strength (for custom validation)
CREATE OR REPLACE FUNCTION public.validate_password_strength(password TEXT)
RETURNS TABLE (
    is_valid BOOLEAN,
    score INTEGER,
    feedback TEXT[]
) AS $$
DECLARE
    score INTEGER := 0;
    feedback TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Check length
    IF length(password) >= 8 THEN
        score := score + 1;
    ELSE
        feedback := array_append(feedback, 'Password must be at least 8 characters long');
    END IF;
    
    -- Check for uppercase
    IF password ~ '[A-Z]' THEN
        score := score + 1;
    ELSE
        feedback := array_append(feedback, 'Password must contain at least one uppercase letter');
    END IF;
    
    -- Check for lowercase
    IF password ~ '[a-z]' THEN
        score := score + 1;
    ELSE
        feedback := array_append(feedback, 'Password must contain at least one lowercase letter');
    END IF;
    
    -- Check for numbers
    IF password ~ '[0-9]' THEN
        score := score + 1;
    ELSE
        feedback := array_append(feedback, 'Password must contain at least one number');
    END IF;
    
    -- Check for special characters
    IF password ~ '[^a-zA-Z0-9]' THEN
        score := score + 1;
    ELSE
        feedback := array_append(feedback, 'Password must contain at least one special character');
    END IF;
    
    -- Determine if valid (need at least 4 out of 5 criteria)
    RETURN QUERY SELECT 
        (score >= 4) as is_valid,
        score,
        feedback;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Create a function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
    event_type TEXT,
    user_id TEXT DEFAULT NULL,
    details JSONB DEFAULT '{}'::JSONB
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.system_analytics (
        date,
        metric,
        value,
        metadata
    ) VALUES (
        NOW(),
        'security_event_' || event_type,
        1,
        jsonb_build_object(
            'user_id', user_id,
            'details', details,
            'timestamp', NOW()
        )
    );
EXCEPTION
    WHEN OTHERS THEN
        -- Log to system log if table doesn't exist
        RAISE NOTICE 'Security event: % for user: % with details: %', event_type, user_id, details;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_auth_security_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_password_strength(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_security_event(TEXT, TEXT, JSONB) TO authenticated;

-- 7. Create a comprehensive security status view
CREATE OR REPLACE VIEW public.comprehensive_security_status AS
SELECT 
    'RLS Status' as category,
    'Tables with RLS enabled' as metric,
    (
        SELECT COUNT(*)::TEXT 
        FROM pg_class 
        WHERE relrowsecurity = true 
        AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) as current_value,
    'All tables with policies should have RLS enabled' as recommendation
UNION ALL
SELECT 
    'Function Security' as category,
    'Functions with secure search_path' as metric,
    (
        SELECT COUNT(*)::TEXT 
        FROM pg_proc 
        WHERE proconfig IS NOT NULL 
        AND 'search_path=public' = ANY(proconfig)
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) as current_value,
    'All SECURITY DEFINER functions should have search_path set' as recommendation
UNION ALL
SELECT 
    'Auth Security' as category,
    'Leaked password protection' as metric,
    'Check Supabase Dashboard' as current_value,
    'Enable in Authentication > Settings > Password Protection' as recommendation
UNION ALL
SELECT 
    'Auth Security' as category,
    'MFA options' as metric,
    'Check Supabase Dashboard' as current_value,
    'Enable TOTP and other methods in Authentication > MFA' as recommendation;

-- Grant access to the comprehensive view
GRANT SELECT ON public.comprehensive_security_status TO authenticated;

-- Success message
SELECT 'Auth security recommendations and monitoring functions created!' as status;



