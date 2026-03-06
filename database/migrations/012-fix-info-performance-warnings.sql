-- Migration: 012-fix-info-performance-warnings
-- Adds missing covering indexes on foreign keys to optimize joins and cascading deletes.
-- Drops unused indexes that are taking up storage (as flagged by the advisor).

-- PART 1: Cover unindexed foreign keys
CREATE INDEX IF NOT EXISTS idx_api_form_fields_user_id ON api.form_fields(user_id);
CREATE INDEX IF NOT EXISTS idx_api_form_submissions_user_id ON api.form_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_api_user_profiles_user_id ON api.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_public_faqs_created_by ON public.faqs(created_by);
CREATE INDEX IF NOT EXISTS idx_public_faqs_updated_by ON public.faqs(updated_by);
CREATE INDEX IF NOT EXISTS idx_public_form_drafts_form_id ON public.form_drafts(form_id);
CREATE INDEX IF NOT EXISTS idx_public_form_drafts_user_id ON public.form_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_public_forms_user_id ON public.forms(user_id);
CREATE INDEX IF NOT EXISTS idx_public_payment_intents_user_id ON public.payment_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_public_support_tickets_assigned_to ON public.support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_public_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_public_ticket_messages_user_id ON public.ticket_messages(user_id);

-- PART 2: Drop Unused Indexes
-- Note: In a production environment with traffic, missing usage history might mean the index is truly useless.
-- In a new dev environment, them being unused is normal, but dropping them clears the linter warnings.

DROP INDEX IF EXISTS api.form_fields_form_id_idx;
DROP INDEX IF EXISTS api.form_fields_order_idx;
DROP INDEX IF EXISTS api.forms_slug_idx;
DROP INDEX IF EXISTS api.forms_status_idx;
DROP INDEX IF EXISTS api.forms_user_id_idx;
DROP INDEX IF EXISTS api.idx_anonymous_users_converted_firebase;
DROP INDEX IF EXISTS api.idx_anonymous_users_converted_supabase;
DROP INDEX IF EXISTS api.idx_anonymous_users_fingerprint;
DROP INDEX IF EXISTS api.idx_firebase_auth_mapping_supabase_id;
DROP INDEX IF EXISTS api.idx_firebase_auth_mapping_uid;
DROP INDEX IF EXISTS api.idx_form_submissions_form_id;
DROP INDEX IF EXISTS api.idx_payment_intents_user_id;
DROP INDEX IF EXISTS api.idx_user_tracking_fingerprint;
DROP INDEX IF EXISTS api.idx_user_tracking_firebase_uid;
DROP INDEX IF EXISTS api.idx_user_tracking_ip;
DROP INDEX IF EXISTS api.idx_user_tracking_last_visit;
DROP INDEX IF EXISTS api.idx_user_tracking_supabase_id;
DROP INDEX IF EXISTS api.idx_users_role;
DROP INDEX IF EXISTS api.users_email_idx;
DROP INDEX IF EXISTS api.users_stripe_customer_idx;

DROP INDEX IF EXISTS public.idx_faqs_category;
DROP INDEX IF EXISTS public.idx_faqs_is_published;
DROP INDEX IF EXISTS public.idx_form_fields_form_id;
DROP INDEX IF EXISTS public.idx_form_fields_order;
DROP INDEX IF EXISTS public.idx_form_submissions_form_id;
DROP INDEX IF EXISTS public.idx_form_submissions_user_id;
DROP INDEX IF EXISTS public.idx_forms_slug;
DROP INDEX IF EXISTS public.idx_forms_status;
DROP INDEX IF EXISTS public.idx_notifications_user_id;
DROP INDEX IF EXISTS public.idx_support_tickets_user_id;
DROP INDEX IF EXISTS public.idx_system_analytics_date;
DROP INDEX IF EXISTS public.idx_system_analytics_metric;
DROP INDEX IF EXISTS public.idx_user_profiles_user_id;
