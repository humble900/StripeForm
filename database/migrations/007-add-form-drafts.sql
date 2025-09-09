-- Migration: Add form drafts table for save and resume functionality
-- Created: 2025-01-01
-- Description: Adds support for partial form submissions and draft storage

-- Create form_drafts table
CREATE TABLE IF NOT EXISTS public.form_drafts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID NOT NULL,
    user_id TEXT, -- Firebase UID or null for anonymous
    session_id TEXT, -- For anonymous users
    fingerprint TEXT, -- Device fingerprint for anonymous users
    draft_data JSONB NOT NULL, -- Partial form data
    progress_data JSONB DEFAULT '{}'::jsonb, -- Field completion tracking
    last_accessed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 days') NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add foreign key constraint to forms table
ALTER TABLE public.form_drafts 
ADD CONSTRAINT form_drafts_form_id_fkey 
FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE;

-- Add foreign key constraint to users table (nullable for anonymous users)
ALTER TABLE public.form_drafts 
ADD CONSTRAINT form_drafts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_form_drafts_form_user ON public.form_drafts(form_id, user_id);
CREATE INDEX IF NOT EXISTS idx_form_drafts_session ON public.form_drafts(session_id);
CREATE INDEX IF NOT EXISTS idx_form_drafts_fingerprint ON public.form_drafts(fingerprint);
CREATE INDEX IF NOT EXISTS idx_form_drafts_expires ON public.form_drafts(expires_at);
CREATE INDEX IF NOT EXISTS idx_form_drafts_form_session ON public.form_drafts(form_id, session_id);
CREATE INDEX IF NOT EXISTS idx_form_drafts_form_fingerprint ON public.form_drafts(form_id, fingerprint);

-- Add unique constraint to prevent duplicate drafts per user/form combination
-- This allows one draft per user per form, or one draft per session per form for anonymous users
CREATE UNIQUE INDEX IF NOT EXISTS idx_form_drafts_unique_user_form 
ON public.form_drafts(form_id, user_id) 
WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_form_drafts_unique_session_form 
ON public.form_drafts(form_id, session_id) 
WHERE session_id IS NOT NULL AND user_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_form_drafts_unique_fingerprint_form 
ON public.form_drafts(form_id, fingerprint) 
WHERE fingerprint IS NOT NULL AND user_id IS NULL AND session_id IS NULL;

-- Add RLS policies for form_drafts table
ALTER TABLE public.form_drafts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own drafts
CREATE POLICY "Users can view own drafts" ON public.form_drafts
    FOR SELECT USING (
        user_id = auth.uid()::text OR 
        session_id = current_setting('request.jwt.claims', true)::json->>'session_id' OR
        fingerprint = current_setting('request.jwt.claims', true)::json->>'fingerprint'
    );

-- Policy: Users can insert their own drafts
CREATE POLICY "Users can insert own drafts" ON public.form_drafts
    FOR INSERT WITH CHECK (
        user_id = auth.uid()::text OR 
        session_id = current_setting('request.jwt.claims', true)::json->>'session_id' OR
        fingerprint = current_setting('request.jwt.claims', true)::json->>'fingerprint'
    );

-- Policy: Users can update their own drafts
CREATE POLICY "Users can update own drafts" ON public.form_drafts
    FOR UPDATE USING (
        user_id = auth.uid()::text OR 
        session_id = current_setting('request.jwt.claims', true)::json->>'session_id' OR
        fingerprint = current_setting('request.jwt.claims', true)::json->>'fingerprint'
    );

-- Policy: Users can delete their own drafts
CREATE POLICY "Users can delete own drafts" ON public.form_drafts
    FOR DELETE USING (
        user_id = auth.uid()::text OR 
        session_id = current_setting('request.jwt.claims', true)::json->>'session_id' OR
        fingerprint = current_setting('request.jwt.claims', true)::json->>'fingerprint'
    );

-- Add function to automatically clean up expired drafts
CREATE OR REPLACE FUNCTION cleanup_expired_drafts()
RETURNS void AS $$
BEGIN
    DELETE FROM public.form_drafts 
    WHERE expires_at < NOW();
    
    -- Log cleanup activity
    INSERT INTO public.system_analytics (date, metric, value, metadata)
    VALUES (NOW(), 'drafts_cleaned_up', 
            (SELECT COUNT(*) FROM public.form_drafts WHERE expires_at < NOW()),
            '{"cleanup_type": "expired_drafts"}');
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup daily (this would be set up in your cron/scheduler)
-- For now, we'll create a manual cleanup function that can be called

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_form_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.last_accessed_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_form_drafts_updated_at
    BEFORE UPDATE ON public.form_drafts
    FOR EACH ROW
    EXECUTE FUNCTION update_form_drafts_updated_at();

-- Add trigger to update last_accessed_at on SELECT (for tracking usage)
CREATE OR REPLACE FUNCTION update_form_drafts_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.form_drafts 
    SET last_accessed_at = NOW() 
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: We'll handle last_accessed_at updates in the application layer
-- as triggers on SELECT can have performance implications

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.form_drafts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.form_drafts TO anon;

-- Add comments for documentation
COMMENT ON TABLE public.form_drafts IS 'Stores partial form submissions (drafts) for save and resume functionality';
COMMENT ON COLUMN public.form_drafts.draft_data IS 'JSONB containing the partial form data entered by user';
COMMENT ON COLUMN public.form_drafts.progress_data IS 'JSONB containing field completion tracking and progress metadata';
COMMENT ON COLUMN public.form_drafts.expires_at IS 'Draft expiration time (default 15 days from creation)';
COMMENT ON COLUMN public.form_drafts.fingerprint IS 'Device fingerprint for anonymous user identification';
