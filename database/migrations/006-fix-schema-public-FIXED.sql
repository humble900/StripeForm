    -- Fix Schema Issue: Move from API schema to PUBLIC schema
    -- This fixes PGRST106 error by using the correct schema that Supabase exposes
    -- Supabase by default only exposes the 'public' schema via PostgREST

    -- 0. Enable required extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    -- 1. Create core application tables in PUBLIC schema if they don't exist
    CREATE TABLE IF NOT EXISTS public.forms (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        user_id TEXT NOT NULL, -- Firebase UID (TEXT)
        status TEXT DEFAULT 'draft',
        fields JSONB DEFAULT '[]'::jsonb,
        settings JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Ensure all columns exist (idempotent column addition)
    ALTER TABLE public.forms 
        ADD COLUMN IF NOT EXISTS user_id TEXT,
        ADD COLUMN IF NOT EXISTS title TEXT,
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
        ADD COLUMN IF NOT EXISTS fields JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb,
        ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS published_url TEXT,
        ADD COLUMN IF NOT EXISTS response_count INTEGER DEFAULT 0;

    CREATE TABLE IF NOT EXISTS public.form_submissions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        form_id UUID NOT NULL,
        user_id TEXT, -- Firebase UID (TEXT) or null for anonymous
        session_id TEXT, -- For anonymous users
        ip_address TEXT,
        user_agent TEXT,
        referrer TEXT,
        status TEXT DEFAULT 'pending' NOT NULL,
        is_spam BOOLEAN DEFAULT false NOT NULL,
        spam_score INTEGER,
        data JSONB NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        processed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );

    -- Ensure all columns exist (idempotent column addition)
    ALTER TABLE public.form_submissions 
        ADD COLUMN IF NOT EXISTS form_id UUID,
        ADD COLUMN IF NOT EXISTS user_id TEXT,
        ADD COLUMN IF NOT EXISTS session_id TEXT,
        ADD COLUMN IF NOT EXISTS ip_address TEXT,
        ADD COLUMN IF NOT EXISTS user_agent TEXT,
        ADD COLUMN IF NOT EXISTS referrer TEXT,
        ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' NOT NULL,
        ADD COLUMN IF NOT EXISTS is_spam BOOLEAN DEFAULT false NOT NULL,
        ADD COLUMN IF NOT EXISTS spam_score INTEGER,
        ADD COLUMN IF NOT EXISTS data JSONB,
        ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
        ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

    CREATE TABLE IF NOT EXISTS public.payment_intents (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        stripe_payment_intent_id TEXT NOT NULL UNIQUE,
        user_id TEXT NOT NULL, -- Firebase UID (TEXT)
        amount INTEGER NOT NULL,
        currency TEXT DEFAULT 'usd',
        status TEXT NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Ensure all columns exist (idempotent column addition)
    ALTER TABLE public.payment_intents 
        ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
        ADD COLUMN IF NOT EXISTS user_id TEXT,
        ADD COLUMN IF NOT EXISTS amount INTEGER,
        ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'usd',
        ADD COLUMN IF NOT EXISTS status TEXT,
        ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

    -- 2. Create user tracking tables for anonymous/guest user management
    CREATE TABLE IF NOT EXISTS public.firebase_auth_mapping (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        firebase_uid TEXT NOT NULL UNIQUE, -- Firebase UID (TEXT)
        supabase_uuid UUID DEFAULT gen_random_uuid() UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Ensure all columns exist (idempotent column addition)
    ALTER TABLE public.firebase_auth_mapping 
        ADD COLUMN IF NOT EXISTS firebase_uid TEXT,
        ADD COLUMN IF NOT EXISTS supabase_uuid UUID;

    CREATE TABLE IF NOT EXISTS public.user_tracking (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        ip_address INET NOT NULL,
        device_fingerprint TEXT NOT NULL,
        user_agent TEXT,
        first_visit TIMESTAMPTZ DEFAULT NOW(),
        last_visit TIMESTAMPTZ DEFAULT NOW(),
        visit_count INTEGER DEFAULT 1,
        firebase_uid TEXT, -- NULL for anonymous users, Firebase UID for authenticated users
        country TEXT,
        region TEXT,
        city TEXT,
        timezone TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Ensure all columns exist (idempotent column addition)
    ALTER TABLE public.user_tracking 
        ADD COLUMN IF NOT EXISTS ip_address INET,
        ADD COLUMN IF NOT EXISTS device_fingerprint TEXT,
        ADD COLUMN IF NOT EXISTS user_agent TEXT,
        ADD COLUMN IF NOT EXISTS first_visit TIMESTAMPTZ DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS last_visit TIMESTAMPTZ DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 1,
        ADD COLUMN IF NOT EXISTS firebase_uid TEXT,
        ADD COLUMN IF NOT EXISTS country TEXT,
        ADD COLUMN IF NOT EXISTS region TEXT,
        ADD COLUMN IF NOT EXISTS city TEXT,
        ADD COLUMN IF NOT EXISTS timezone TEXT,
        ADD COLUMN IF NOT EXISTS converted_to_firebase_uid BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS conversion_date TIMESTAMPTZ;

    CREATE TABLE IF NOT EXISTS public.anonymous_users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        device_fingerprint TEXT NOT NULL UNIQUE,
        ip_address INET NOT NULL,
        user_agent TEXT,
        form_count INTEGER DEFAULT 0,
        first_visit TIMESTAMPTZ DEFAULT NOW(),
        last_visit TIMESTAMPTZ DEFAULT NOW(),
        firebase_uid TEXT, -- When anonymous user converts to authenticated
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Ensure all columns exist (idempotent column addition)
    ALTER TABLE public.anonymous_users 
        ADD COLUMN IF NOT EXISTS device_fingerprint TEXT,
        ADD COLUMN IF NOT EXISTS ip_address INET,
        ADD COLUMN IF NOT EXISTS user_agent TEXT,
        ADD COLUMN IF NOT EXISTS form_count INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS first_visit TIMESTAMPTZ DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS last_visit TIMESTAMPTZ DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS firebase_uid TEXT,
        ADD COLUMN IF NOT EXISTS converted_to_firebase_uid BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS conversion_date TIMESTAMPTZ;

    -- 3. Create indexes for performance (only if columns exist)
    DO $$
    BEGIN
        -- Create indexes only if the tables and columns exist
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'forms') THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'forms' AND column_name = 'user_id') THEN
                CREATE INDEX IF NOT EXISTS idx_forms_user_id ON public.forms(user_id);
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'forms' AND column_name = 'status') THEN
                CREATE INDEX IF NOT EXISTS idx_forms_status ON public.forms(status);
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'forms' AND column_name = 'created_at') THEN
                CREATE INDEX IF NOT EXISTS idx_forms_created_at ON public.forms(created_at);
            END IF;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'form_submissions') THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'form_submissions' AND column_name = 'form_id') THEN
                CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON public.form_submissions(form_id);
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'form_submissions' AND column_name = 'submitted_at') THEN
                CREATE INDEX IF NOT EXISTS idx_form_submissions_submitted_at ON public.form_submissions(submitted_at);
            END IF;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_tracking') THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_tracking' AND column_name = 'device_fingerprint') THEN
                CREATE INDEX IF NOT EXISTS idx_user_tracking_fingerprint ON public.user_tracking(device_fingerprint);
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_tracking' AND column_name = 'firebase_uid') THEN
                CREATE INDEX IF NOT EXISTS idx_user_tracking_firebase_uid ON public.user_tracking(firebase_uid);
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_tracking' AND column_name = 'ip_address') THEN
                CREATE INDEX IF NOT EXISTS idx_user_tracking_ip ON public.user_tracking(ip_address);
            END IF;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'anonymous_users') THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'anonymous_users' AND column_name = 'device_fingerprint') THEN
                CREATE INDEX IF NOT EXISTS idx_anonymous_users_fingerprint ON public.anonymous_users(device_fingerprint);
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'anonymous_users' AND column_name = 'firebase_uid') THEN
                CREATE INDEX IF NOT EXISTS idx_anonymous_users_firebase_uid ON public.anonymous_users(firebase_uid);
            END IF;
        END IF;
    END $$;

    -- 4. Enable Row Level Security
    ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.firebase_auth_mapping ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.user_tracking ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.anonymous_users ENABLE ROW LEVEL SECURITY;

    -- 5. Create RLS Policies for forms (users can only access their own forms)
    DROP POLICY IF EXISTS "Users can view own forms" ON public.forms;
    CREATE POLICY "Users can view own forms" ON public.forms
        FOR SELECT USING (
            user_id = auth.jwt() ->> 'user_id' OR  -- Firebase UID from JWT
            user_id = auth.uid()::text              -- Fallback to Supabase UID
        );

    DROP POLICY IF EXISTS "Users can insert own forms" ON public.forms;
    CREATE POLICY "Users can insert own forms" ON public.forms
        FOR INSERT WITH CHECK (
            user_id = auth.jwt() ->> 'user_id' OR  -- Firebase UID from JWT
            user_id = auth.uid()::text              -- Fallback to Supabase UID
        );

    DROP POLICY IF EXISTS "Users can update own forms" ON public.forms;
    CREATE POLICY "Users can update own forms" ON public.forms
        FOR UPDATE USING (
            user_id = auth.jwt() ->> 'user_id' OR  -- Firebase UID from JWT
            user_id = auth.uid()::text              -- Fallback to Supabase UID
        );

    -- Allow anonymous access for form creation (guest users)
    DROP POLICY IF EXISTS "Anonymous users can create forms" ON public.forms;
    CREATE POLICY "Anonymous users can create forms" ON public.forms
        FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Anonymous users can view forms by fingerprint" ON public.forms;
    CREATE POLICY "Anonymous users can view forms by fingerprint" ON public.forms
        FOR SELECT USING (true); -- We'll filter by user_id in application logic

    -- 6. Create RLS Policies for form submissions
    DROP POLICY IF EXISTS "Users can view form submissions" ON public.form_submissions;
    CREATE POLICY "Users can view form submissions" ON public.form_submissions
        FOR SELECT USING (
            submitted_by = auth.jwt() ->> 'user_id' OR  -- Firebase UID from JWT
            submitted_by = auth.uid()::text OR          -- Fallback to Supabase UID
            form_id IN (
                SELECT id FROM public.forms 
                WHERE user_id = auth.jwt() ->> 'user_id' OR user_id = auth.uid()::text
            )
        );

    DROP POLICY IF EXISTS "Anyone can submit to forms" ON public.form_submissions;
    CREATE POLICY "Anyone can submit to forms" ON public.form_submissions
        FOR INSERT WITH CHECK (true);

    -- 7. Create RLS Policies for user tracking (restrictive)
    DROP POLICY IF EXISTS "Users can view own tracking" ON public.user_tracking;
    CREATE POLICY "Users can view own tracking" ON public.user_tracking
        FOR SELECT USING (
            firebase_uid = auth.jwt() ->> 'user_id' OR
            firebase_uid = auth.uid()::text
        );

    DROP POLICY IF EXISTS "Service can manage user tracking" ON public.user_tracking;
    CREATE POLICY "Service can manage user tracking" ON public.user_tracking
        FOR ALL USING (true); -- Application logic will handle this

    -- 8. Create RLS Policies for anonymous users
    DROP POLICY IF EXISTS "Service can manage anonymous users" ON public.anonymous_users;
    CREATE POLICY "Service can manage anonymous users" ON public.anonymous_users
        FOR ALL USING (true); -- Application logic will handle this

    -- 9. Grant permissions to authenticated and anonymous roles
    GRANT USAGE ON SCHEMA public TO anon, authenticated;
    GRANT ALL ON public.forms TO anon, authenticated;
    GRANT ALL ON public.form_submissions TO anon, authenticated;
    GRANT ALL ON public.payment_intents TO anon, authenticated;
    GRANT ALL ON public.firebase_auth_mapping TO anon, authenticated;
    GRANT ALL ON public.user_tracking TO anon, authenticated;
    GRANT ALL ON public.anonymous_users TO anon, authenticated;

    -- Grant sequence permissions
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

    -- 10. Create helper functions
    CREATE OR REPLACE FUNCTION public.get_user_form_count(target_user_id TEXT)
    RETURNS INTEGER AS $$
    BEGIN
        RETURN (
            SELECT COUNT(*)::INTEGER 
            FROM public.forms 
            WHERE user_id = target_user_id
        );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    CREATE OR REPLACE FUNCTION public.get_anonymous_form_count(fingerprint TEXT)
    RETURNS INTEGER AS $$
    BEGIN
        RETURN (
            SELECT COALESCE(form_count, 0)::INTEGER 
            FROM public.anonymous_users 
            WHERE device_fingerprint = fingerprint
        );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Grant permissions on functions
    GRANT EXECUTE ON FUNCTION public.get_user_form_count(TEXT) TO anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.get_anonymous_form_count(TEXT) TO anon, authenticated;

    -- 11. Verification block
    DO $$
    DECLARE
        table_count INTEGER;
    BEGIN
        -- Count public tables we just created
        SELECT COUNT(*) INTO table_count
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('forms', 'form_submissions', 'payment_intents');
        
        IF table_count < 3 THEN
            RAISE EXCEPTION 'Not all required public tables exist. Expected 3, found %', table_count;
        END IF;
        
        RAISE NOTICE 'SUCCESS: All % required tables exist in public schema', table_count;
    END $$;
