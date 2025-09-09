-- Auth Security Recommendations
-- This script provides recommendations for addressing auth security warnings

-- Note: The following warnings require Supabase Dashboard configuration changes:
-- 1. auth_leaked_password_protection - Enable in Auth > Settings > Password Protection
-- 2. auth_insufficient_mfa_options - Enable in Auth > Settings > Multi-Factor Authentication

-- This script creates monitoring functions and security event logging

-- 1. Create security event logging table
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    user_id TEXT,
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS on security_events table
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for security_events
DROP POLICY IF EXISTS "Admin can view all security events" ON public.security_events;
CREATE POLICY "Admin can view all security events" ON public.security_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid()::text 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- 4. Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
    event_type TEXT,
    user_id TEXT DEFAULT NULL,
    ip_address INET DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO public.security_events (
        event_type,
        user_id,
        ip_address,
        user_agent,
        details
    ) VALUES (
        log_security_event.event_type,
        log_security_event.user_id,
        log_security_event.ip_address,
        log_security_event.user_agent,
        log_security_event.details
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Create function to check password strength (basic validation)
-- Drop existing function first if it exists with different return type
DROP FUNCTION IF EXISTS public.validate_password_strength(TEXT);
CREATE OR REPLACE FUNCTION public.validate_password_strength(password TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    has_upper BOOLEAN;
    has_lower BOOLEAN;
    has_number BOOLEAN;
    has_special BOOLEAN;
    length_check BOOLEAN;
BEGIN
    -- Check password requirements
    has_upper := password ~ '[A-Z]';
    has_lower := password ~ '[a-z]';
    has_number := password ~ '[0-9]';
    has_special := password ~ '[^A-Za-z0-9]';
    length_check := length(password) >= 8;
    
    result := jsonb_build_object(
        'is_valid', has_upper AND has_lower AND has_number AND has_special AND length_check,
        'has_upper', has_upper,
        'has_lower', has_lower,
        'has_number', has_number,
        'has_special', has_special,
        'length_check', length_check,
        'length', length(password)
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Create function to get security status
CREATE OR REPLACE FUNCTION public.get_security_status()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    rls_tables INTEGER;
    secure_functions INTEGER;
    total_functions INTEGER;
BEGIN
    -- Count tables with RLS enabled
    SELECT COUNT(*) INTO rls_tables
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND c.relrowsecurity = true;
    
    -- Count functions with proper search_path
    SELECT COUNT(*) INTO secure_functions
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.prosecdef = true
    AND p.proconfig IS NOT NULL
    AND 'search_path=public' = ANY(p.proconfig);
    
    -- Count total functions
    SELECT COUNT(*) INTO total_functions
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public';
    
    result := jsonb_build_object(
        'rls_enabled_tables', rls_tables,
        'secure_functions', secure_functions,
        'total_functions', total_functions,
        'security_score', CASE 
            WHEN total_functions > 0 THEN 
                ROUND((secure_functions::DECIMAL / total_functions::DECIMAL) * 100, 2)
            ELSE 0 
        END,
        'recommendations', jsonb_build_array(
            'Enable leaked password protection in Supabase Auth settings',
            'Enable multiple MFA options in Supabase Auth settings',
            'Regularly review security events log',
            'Monitor failed login attempts'
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION public.log_security_event(TEXT, TEXT, INET, TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_password_strength(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_security_status() TO authenticated;

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_events_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at);

-- Success message
SELECT 'Auth security recommendations and monitoring functions created successfully!' as status;




