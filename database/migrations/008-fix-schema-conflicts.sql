-- Migration: Fix schema conflicts and align with Drizzle schema
-- Created: 2025-01-01
-- Description: Resolves conflicts between existing database and new Drizzle schema

-- 1. Drop problematic RLS policies that reference non-existent columns
DROP POLICY IF EXISTS "Users can view form submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Users can insert form submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Users can update form submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Users can delete form submissions" ON public.form_submissions;

-- 2. Add missing columns to forms table to match Drizzle schema
ALTER TABLE public.forms 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allow_anonymous BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS require_captcha BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_submissions INTEGER,
ADD COLUMN IF NOT EXISTS submission_limit INTEGER,
ADD COLUMN IF NOT EXISTS submission_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS theme JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS brand_kit JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS published_url TEXT,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 3. Create form_fields table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.form_fields (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID NOT NULL,
    type TEXT NOT NULL,
    label TEXT NOT NULL,
    placeholder TEXT,
    required BOOLEAN DEFAULT false,
    validation JSONB,
    options JSONB,
    "order" INTEGER NOT NULL,
    settings JSONB DEFAULT '{}',
    conditional_logic JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Add foreign key constraint for form_fields
ALTER TABLE public.form_fields 
ADD CONSTRAINT form_fields_form_id_fkey 
FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE;

-- 5. Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY, -- Firebase UID
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    first_name TEXT,
    last_name TEXT,
    phone_number TEXT,
    country_code TEXT,
    role TEXT DEFAULT 'user',
    status TEXT DEFAULT 'active',
    email_verified BOOLEAN DEFAULT false,
    email_verification_token TEXT,
    password_reset_token TEXT,
    password_reset_expires TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    stripe_customer_id TEXT,
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'inactive',
    subscription_expires_at TIMESTAMPTZ,
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create user_profiles table if it doesn't exist
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
    language TEXT DEFAULT 'en',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Add foreign key constraint for user_profiles
ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 8. Update forms table to reference users
ALTER TABLE public.forms 
ADD CONSTRAINT forms_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 9. Create form_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.form_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    thumbnail TEXT,
    template_data JSONB NOT NULL,
    usage_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Create support_tickets table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'medium',
    category TEXT DEFAULT 'general',
    assigned_to TEXT,
    resolution TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread',
    metadata JSONB DEFAULT '{}',
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Create faqs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Create anonymous_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.anonymous_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fingerprint TEXT NOT NULL UNIQUE,
    session_data JSONB DEFAULT '{}',
    form_count INTEGER DEFAULT 0 NOT NULL,
    last_seen TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Ensure all columns exist (idempotent column addition)
ALTER TABLE public.faqs 
ADD COLUMN IF NOT EXISTS question TEXT,
ADD COLUMN IF NOT EXISTS answer TEXT,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 14. Create system_analytics table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    metric TEXT NOT NULL,
    value INTEGER NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist (idempotent column addition)
ALTER TABLE public.system_analytics 
ADD COLUMN IF NOT EXISTS date DATE,
ADD COLUMN IF NOT EXISTS metric TEXT,
ADD COLUMN IF NOT EXISTS value INTEGER,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 15. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_forms_user_id ON public.forms(user_id);
CREATE INDEX IF NOT EXISTS idx_forms_status ON public.forms(status);
CREATE INDEX IF NOT EXISTS idx_forms_slug ON public.forms(slug);
CREATE INDEX IF NOT EXISTS idx_form_fields_form_id ON public.form_fields(form_id);
CREATE INDEX IF NOT EXISTS idx_form_fields_order ON public.form_fields("order");
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON public.form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_user_id ON public.form_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON public.faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_is_published ON public.faqs(is_published);
CREATE INDEX IF NOT EXISTS idx_system_analytics_date ON public.system_analytics(date);
CREATE INDEX IF NOT EXISTS idx_system_analytics_metric ON public.system_analytics(metric);

-- 16. Recreate RLS policies with correct column references
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_analytics ENABLE ROW LEVEL SECURITY;

-- 17. Create RLS policies for forms
DROP POLICY IF EXISTS "Users can view own forms" ON public.forms;
CREATE POLICY "Users can view own forms" ON public.forms
    FOR SELECT USING (
        user_id = auth.jwt() ->> 'user_id' OR
        user_id = auth.uid()::text
    );

DROP POLICY IF EXISTS "Users can insert own forms" ON public.forms;
CREATE POLICY "Users can insert own forms" ON public.forms
    FOR INSERT WITH CHECK (
        user_id = auth.jwt() ->> 'user_id' OR
        user_id = auth.uid()::text
    );

DROP POLICY IF EXISTS "Users can update own forms" ON public.forms;
CREATE POLICY "Users can update own forms" ON public.forms
    FOR UPDATE USING (
        user_id = auth.jwt() ->> 'user_id' OR
        user_id = auth.uid()::text
    );

DROP POLICY IF EXISTS "Anonymous users can create forms" ON public.forms;
CREATE POLICY "Anonymous users can create forms" ON public.forms
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anonymous users can view forms by fingerprint" ON public.forms;
CREATE POLICY "Anonymous users can view forms by fingerprint" ON public.forms
    FOR SELECT USING (true);

-- 18. Create RLS policies for form_fields
DROP POLICY IF EXISTS "Users can view form fields" ON public.form_fields;
CREATE POLICY "Users can view form fields" ON public.form_fields
    FOR SELECT USING (
        form_id IN (
            SELECT id FROM public.forms 
            WHERE user_id = auth.jwt() ->> 'user_id' OR user_id = auth.uid()::text
        )
    );

DROP POLICY IF EXISTS "Users can manage form fields" ON public.form_fields;
CREATE POLICY "Users can manage form fields" ON public.form_fields
    FOR ALL USING (
        form_id IN (
            SELECT id FROM public.forms 
            WHERE user_id = auth.jwt() ->> 'user_id' OR user_id = auth.uid()::text
        )
    );

-- 19. Create RLS policies for form_submissions
DROP POLICY IF EXISTS "Users can view form submissions" ON public.form_submissions;
CREATE POLICY "Users can view form submissions" ON public.form_submissions
    FOR SELECT USING (
        user_id = auth.jwt() ->> 'user_id' OR
        user_id = auth.uid()::text OR
        form_id IN (
            SELECT id FROM public.forms 
            WHERE user_id = auth.jwt() ->> 'user_id' OR user_id = auth.uid()::text
        )
    );

DROP POLICY IF EXISTS "Anyone can submit to forms" ON public.form_submissions;
CREATE POLICY "Anyone can submit to forms" ON public.form_submissions
    FOR INSERT WITH CHECK (true);

-- 20. Create RLS policies for users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (
        id = auth.jwt() ->> 'user_id' OR
        id = auth.uid()::text
    );

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (
        id = auth.jwt() ->> 'user_id' OR
        id = auth.uid()::text
    );

-- 21. Create RLS policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile data" ON public.user_profiles;
CREATE POLICY "Users can view own profile data" ON public.user_profiles
    FOR SELECT USING (
        user_id = auth.jwt() ->> 'user_id' OR
        user_id = auth.uid()::text
    );

DROP POLICY IF EXISTS "Users can manage own profile data" ON public.user_profiles;
CREATE POLICY "Users can manage own profile data" ON public.user_profiles
    FOR ALL USING (
        user_id = auth.jwt() ->> 'user_id' OR
        user_id = auth.uid()::text
    );

-- 22. Create RLS policies for form_templates (public read)
DROP POLICY IF EXISTS "Anyone can view templates" ON public.form_templates;
CREATE POLICY "Anyone can view templates" ON public.form_templates
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage templates" ON public.form_templates;
CREATE POLICY "Admins can manage templates" ON public.form_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.jwt() ->> 'user_id' 
            AND role IN ('admin', 'super_admin')
        )
    );

-- 23. Create RLS policies for support_tickets
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets" ON public.support_tickets
    FOR SELECT USING (
        user_id = auth.jwt() ->> 'user_id' OR
        user_id = auth.uid()::text
    );

DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;
CREATE POLICY "Users can create tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (
        user_id = auth.jwt() ->> 'user_id' OR
        user_id = auth.uid()::text
    );

-- 24. Create RLS policies for notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (
        user_id = auth.jwt() ->> 'user_id' OR
        user_id = auth.uid()::text
    );

DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;
CREATE POLICY "Users can manage own notifications" ON public.notifications
    FOR ALL USING (
        user_id = auth.jwt() ->> 'user_id' OR
        user_id = auth.uid()::text
    );

-- 25. Create RLS policies for faqs (public read)
DROP POLICY IF EXISTS "Anyone can view published faqs" ON public.faqs;
CREATE POLICY "Anyone can view published faqs" ON public.faqs
    FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage faqs" ON public.faqs;
CREATE POLICY "Admins can manage faqs" ON public.faqs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.jwt() ->> 'user_id' 
            AND role IN ('admin', 'super_admin')
        )
    );

-- 26. Create RLS policies for system_analytics (admin only)
DROP POLICY IF EXISTS "Admins can view analytics" ON public.system_analytics;
CREATE POLICY "Admins can view analytics" ON public.system_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.jwt() ->> 'user_id' 
            AND role IN ('admin', 'super_admin')
        )
    );

-- 27. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.forms TO anon, authenticated;
GRANT ALL ON public.form_fields TO anon, authenticated;
GRANT ALL ON public.form_submissions TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.user_profiles TO anon, authenticated;
GRANT ALL ON public.form_templates TO anon, authenticated;
GRANT ALL ON public.support_tickets TO anon, authenticated;
GRANT ALL ON public.notifications TO anon, authenticated;
GRANT ALL ON public.faqs TO anon, authenticated;
GRANT ALL ON public.system_analytics TO anon, authenticated;
GRANT ALL ON public.anonymous_users TO anon, authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 28. Verification
DO $verify$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
        AND table_name IN ('forms', 'form_fields', 'form_submissions', 'users', 'user_profiles', 'form_templates', 'support_tickets', 'notifications', 'faqs', 'system_analytics', 'anonymous_users');
    
    IF table_count < 11 THEN
        RAISE EXCEPTION 'Not all required tables exist. Expected 11, found %', table_count;
    END IF;
    
    RAISE NOTICE 'SUCCESS: All % required tables exist in public schema', table_count;
END $verify$;
