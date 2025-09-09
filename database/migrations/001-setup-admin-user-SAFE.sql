-- Setup Admin User for StripeForm - SAFE VERSION
-- This script safely creates missing tables and sets up admin user
-- Run this in your Supabase SQL editor

-- 0. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create missing tables that weren't in the previous migration

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY, -- Firebase UID
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    first_name TEXT,
    last_name TEXT,
    phone_number TEXT,
    country_code TEXT,
    role TEXT DEFAULT 'user' NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL,
    email_verified BOOLEAN DEFAULT false NOT NULL,
    email_verification_token TEXT,
    password_reset_token TEXT,
    password_reset_expires TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    stripe_customer_id TEXT,
    subscription_tier TEXT DEFAULT 'free' NOT NULL,
    subscription_status TEXT DEFAULT 'inactive' NOT NULL,
    subscription_expires_at TIMESTAMPTZ,
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    avatar TEXT,
    bio TEXT,
    company TEXT,
    website TEXT,
    phone TEXT,
    address JSONB,
    timezone TEXT,
    language TEXT DEFAULT 'en' NOT NULL,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create form_fields table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.form_fields (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID NOT NULL,
    type TEXT NOT NULL,
    label TEXT NOT NULL,
    placeholder TEXT,
    required BOOLEAN DEFAULT false NOT NULL,
    validation JSONB,
    options JSONB,
    "order" INTEGER NOT NULL,
    settings JSONB DEFAULT '{}',
    conditional_logic JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create form_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.form_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    thumbnail TEXT,
    template_data JSONB NOT NULL,
    usage_count INTEGER DEFAULT 0 NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Add foreign key constraints if they don't exist
DO $$
BEGIN
    -- Add foreign key for user_profiles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_profiles_user_id_fkey' 
        AND table_name = 'user_profiles'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD CONSTRAINT user_profiles_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key for form_fields
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'form_fields_form_id_fkey' 
        AND table_name = 'form_fields'
    ) THEN
        ALTER TABLE public.form_fields 
        ADD CONSTRAINT form_fields_form_id_fkey 
        FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Enable Row Level Security on new tables (only if not already enabled)
DO $$
BEGIN
    -- Check and enable RLS for users table
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'users' 
        AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Check and enable RLS for user_profiles table
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'user_profiles' 
        AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Check and enable RLS for form_fields table
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'form_fields' 
        AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Check and enable RLS for form_templates table
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'form_templates' 
        AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 4. Create basic RLS policies for new tables (drop first to avoid conflicts)

-- Users policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id);

-- User profiles policies
DROP POLICY IF EXISTS "Users can view own profile details" ON public.user_profiles;
CREATE POLICY "Users can view own profile details" ON public.user_profiles
    FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update own profile details" ON public.user_profiles;
CREATE POLICY "Users can update own profile details" ON public.user_profiles
    FOR UPDATE USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert own profile details" ON public.user_profiles;
CREATE POLICY "Users can insert own profile details" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Form fields policies
DROP POLICY IF EXISTS "Users can view own form fields" ON public.form_fields;
CREATE POLICY "Users can view own form fields" ON public.form_fields
    FOR SELECT USING (
        form_id IN (
            SELECT id FROM public.forms 
            WHERE user_id = auth.uid()::text
        )
    );

DROP POLICY IF EXISTS "Users can update own form fields" ON public.form_fields;
CREATE POLICY "Users can update own form fields" ON public.form_fields
    FOR UPDATE USING (
        form_id IN (
            SELECT id FROM public.forms 
            WHERE user_id = auth.uid()::text
        )
    );

DROP POLICY IF EXISTS "Users can insert own form fields" ON public.form_fields;
CREATE POLICY "Users can insert own form fields" ON public.form_fields
    FOR INSERT WITH CHECK (
        form_id IN (
            SELECT id FROM public.forms 
            WHERE user_id = auth.uid()::text
        )
    );

-- Form templates policies (public read access)
DROP POLICY IF EXISTS "Anyone can view form templates" ON public.form_templates;
CREATE POLICY "Anyone can view form templates" ON public.form_templates
    FOR SELECT USING (true);

-- 5. Insert admin user
INSERT INTO public.users (
    id,
    email,
    role,
    created_at,
    updated_at
) VALUES (
    'xBesp0ZBq5h0vS34Ka6eIvFRkmf1', -- Firebase UID for admin@stripeform.com
    'admin@stripeform.com',
    'admin',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    updated_at = NOW();

-- 6. Create admin policies for all tables (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE public.users.id = auth.uid()::text 
            AND public.users.role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE public.users.id = auth.uid()::text 
            AND public.users.role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Admins can view all forms" ON public.forms;
CREATE POLICY "Admins can view all forms" ON public.forms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE public.users.id = auth.uid()::text 
            AND public.users.role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Admins can view all form submissions" ON public.form_submissions;
CREATE POLICY "Admins can view all form submissions" ON public.form_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE public.users.id = auth.uid()::text 
            AND public.users.role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Admins can view all payment intents" ON public.payment_intents;
CREATE POLICY "Admins can view all payment intents" ON public.payment_intents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE public.users.id = auth.uid()::text 
            AND public.users.role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Admins can view all form fields" ON public.form_fields;
CREATE POLICY "Admins can view all form fields" ON public.form_fields
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE public.users.id = auth.uid()::text 
            AND public.users.role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Admins can view all anonymous users" ON public.anonymous_users;
CREATE POLICY "Admins can view all anonymous users" ON public.anonymous_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE public.users.id = auth.uid()::text 
            AND public.users.role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Admins can manage all form templates" ON public.form_templates;
CREATE POLICY "Admins can manage all form templates" ON public.form_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE public.users.id = auth.uid()::text 
            AND public.users.role IN ('admin', 'super_admin')
        )
    );

-- 7. Create helper functions
CREATE OR REPLACE FUNCTION public.is_admin(user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE public.users.id = user_id 
        AND public.users.role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated;

-- 9. Create index on role for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 10. Update existing users to have 'user' role if they don't have one
UPDATE public.users SET role = 'user' WHERE role IS NULL;

-- 11. Create admin dashboard view (drop first to avoid conflicts)
DROP VIEW IF EXISTS public.admin_dashboard_stats;
CREATE VIEW public.admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM public.users) as total_users,
    (SELECT COUNT(*) FROM public.forms) as total_forms,
    (SELECT COUNT(*) FROM public.form_submissions) as total_submissions,
    (SELECT COUNT(*) FROM public.payment_intents) as total_payments,
    (SELECT COUNT(*) FROM public.users WHERE role IN ('admin', 'super_admin')) as total_admins,
    (SELECT COUNT(*) FROM public.users WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_month,
    (SELECT COUNT(*) FROM public.forms WHERE created_at >= NOW() - INTERVAL '30 days') as new_forms_month,
    (SELECT COUNT(*) FROM public.form_submissions WHERE created_at >= NOW() - INTERVAL '30 days') as new_submissions_month;

-- 12. Grant access to admin dashboard view
GRANT SELECT ON public.admin_dashboard_stats TO authenticated;

-- 13. Grant permissions to authenticated and anonymous roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.user_profiles TO anon, authenticated;
GRANT ALL ON public.form_fields TO anon, authenticated;
GRANT ALL ON public.form_templates TO anon, authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'Admin user setup completed successfully!' as status;
