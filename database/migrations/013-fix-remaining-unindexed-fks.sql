-- Migration: 013-fix-remaining-unindexed-fks
-- Adds the second batch of covering indexes for foreign keys flagged by the Performance Advisor.
-- Note: Supabase will flag these newly created indexes as "unused_index" until actual app traffic queries them. Do not delete them!

CREATE INDEX IF NOT EXISTS idx_api_form_fields_form_id ON api.form_fields(form_id);
CREATE INDEX IF NOT EXISTS idx_api_form_submissions_form_id ON api.form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_api_forms_user_id ON api.forms(user_id);
CREATE INDEX IF NOT EXISTS idx_api_payment_intents_user_id ON api.payment_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_public_form_fields_form_id ON public.form_fields(form_id);
CREATE INDEX IF NOT EXISTS idx_public_form_submissions_form_id ON public.form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_public_form_submissions_user_id ON public.form_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_public_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_public_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_public_user_profiles_user_id ON public.user_profiles(user_id);
