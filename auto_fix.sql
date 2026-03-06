ALTER TABLE public.firebase_auth_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tracking ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage all form templates" ON api.form_templates;
CREATE POLICY "Admins can manage all form templates" ON api.form_templates AS PERMISSIVE FOR ALL TO PUBLIC USING ((EXISTS ( SELECT 1
   FROM api.users
  WHERE ((users.id = ((select auth.uid()))::text) AND (users.role = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))))));
DROP POLICY IF EXISTS "Admins can update all users" ON api.users;
CREATE POLICY "Admins can update all users" ON api.users AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((EXISTS ( SELECT 1
   FROM api.users users_1
  WHERE ((users_1.id = ((select auth.uid()))::text) AND (users_1.role = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))))));
DROP POLICY IF EXISTS "Admins can view all users" ON api.users;
CREATE POLICY "Admins can view all users" ON api.users AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1
   FROM api.users users_1
  WHERE ((users_1.id = ((select auth.uid()))::text) AND (users_1.role = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))))));
DROP POLICY IF EXISTS "Users can delete own profile" ON api.users;
CREATE POLICY "Users can delete own profile" ON api.users AS PERMISSIVE FOR DELETE TO PUBLIC USING ((((select auth.uid()))::text = id));
DROP POLICY IF EXISTS "Users can update own profile" ON api.users;
CREATE POLICY "Users can update own profile" ON api.users AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((((select auth.uid()))::text = id));
DROP POLICY IF EXISTS "Users can view own profile" ON api.users;
CREATE POLICY "Users can view own profile" ON api.users AS PERMISSIVE FOR SELECT TO PUBLIC USING ((((select auth.uid()))::text = id));
DROP POLICY IF EXISTS "Users can delete own profile details" ON api.user_profiles;
CREATE POLICY "Users can delete own profile details" ON api.user_profiles AS PERMISSIVE FOR DELETE TO PUBLIC USING ((((select auth.uid()))::text = user_id));
DROP POLICY IF EXISTS "Users can insert own profile details" ON api.user_profiles;
CREATE POLICY "Users can insert own profile details" ON api.user_profiles AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((((select auth.uid()))::text = user_id));
DROP POLICY IF EXISTS "Users can update own profile details" ON api.user_profiles;
CREATE POLICY "Users can update own profile details" ON api.user_profiles AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((((select auth.uid()))::text = user_id));
DROP POLICY IF EXISTS "Users can view own profile details" ON api.user_profiles;
CREATE POLICY "Users can view own profile details" ON api.user_profiles AS PERMISSIVE FOR SELECT TO PUBLIC USING ((((select auth.uid()))::text = user_id));
DROP POLICY IF EXISTS "Admins can view all form fields" ON api.form_fields;
CREATE POLICY "Admins can view all form fields" ON api.form_fields AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1
   FROM api.users
  WHERE ((users.id = ((select auth.uid()))::text) AND (users.role = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))))));
DROP POLICY IF EXISTS "Users can delete own form fields" ON api.form_fields;
CREATE POLICY "Users can delete own form fields" ON api.form_fields AS PERMISSIVE FOR DELETE TO PUBLIC USING ((((select auth.uid()))::text = user_id));
DROP POLICY IF EXISTS "Users can insert own form fields" ON api.form_fields;
CREATE POLICY "Users can insert own form fields" ON api.form_fields AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((((select auth.uid()))::text = user_id));
DROP POLICY IF EXISTS "Users can update own form fields" ON api.form_fields;
CREATE POLICY "Users can update own form fields" ON api.form_fields AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((((select auth.uid()))::text = user_id));
DROP POLICY IF EXISTS "Users can view own form fields" ON api.form_fields;
CREATE POLICY "Users can view own form fields" ON api.form_fields AS PERMISSIVE FOR SELECT TO PUBLIC USING ((((select auth.uid()))::text = user_id));
DROP POLICY IF EXISTS "Admins can view all anonymous users" ON api.anonymous_users;
CREATE POLICY "Admins can view all anonymous users" ON api.anonymous_users AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1
   FROM api.users
  WHERE ((users.id = ((select auth.uid()))::text) AND (users.role = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))))));
DROP POLICY IF EXISTS "Admins can view all form fields" ON public.form_fields;
CREATE POLICY "Admins can view all form fields" ON public.form_fields AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = (( SELECT (select auth.uid()) AS uid))::text) AND (users.role = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))))));
DROP POLICY IF EXISTS "Users can manage form fields" ON public.form_fields;
CREATE POLICY "Users can manage form fields" ON public.form_fields AS PERMISSIVE FOR ALL TO PUBLIC USING ((form_id IN ( SELECT forms.id
   FROM forms
  WHERE (forms.user_id = (( SELECT (select auth.uid()) AS uid))::text))));
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users" ON public.users AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((EXISTS ( SELECT 1
   FROM users users_1
  WHERE ((users_1.id = (( SELECT (select auth.uid()) AS uid))::text) AND (users_1.role = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))))));
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1
   FROM users users_1
  WHERE ((users_1.id = (( SELECT (select auth.uid()) AS uid))::text) AND (users_1.role = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))))));
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((id = (( SELECT (select auth.uid()) AS uid))::text));
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users AS PERMISSIVE FOR SELECT TO PUBLIC USING ((id = (( SELECT (select auth.uid()) AS uid))::text));
DROP POLICY IF EXISTS "Admins can view analytics" ON public.system_analytics;
CREATE POLICY "Admins can view analytics" ON public.system_analytics AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = (( SELECT (select auth.uid()) AS uid))::text) AND (users.role = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))))));
DROP POLICY IF EXISTS "Users can manage own profile data" ON public.user_profiles;
CREATE POLICY "Users can manage own profile data" ON public.user_profiles AS PERMISSIVE FOR ALL TO PUBLIC USING ((user_id = (( SELECT (select auth.uid()) AS uid))::text));
DROP POLICY IF EXISTS "Admins can manage form templates" ON public.form_templates;
CREATE POLICY "Admins can manage form templates" ON public.form_templates AS PERMISSIVE FOR ALL TO PUBLIC USING ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = (( SELECT (select auth.uid()) AS uid))::text) AND (users.role = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))))));
DROP POLICY IF EXISTS "Admins can view all forms" ON api.forms;
CREATE POLICY "Admins can view all forms" ON api.forms AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1
   FROM api.users
  WHERE ((users.id = ((select auth.uid()))::text) AND (users.role = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))))));
DROP POLICY IF EXISTS "Users can create forms" ON api.forms;
CREATE POLICY "Users can create forms" ON api.forms AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((user_id = ((select auth.jwt()) ->> 'user_id'::text)));
DROP POLICY IF EXISTS "Users can delete own forms" ON api.forms;
CREATE POLICY "Users can delete own forms" ON api.forms AS PERMISSIVE FOR DELETE TO PUBLIC USING ((user_id = ((select auth.jwt()) ->> 'user_id'::text)));
DROP POLICY IF EXISTS "Users can insert own forms" ON api.forms;
CREATE POLICY "Users can insert own forms" ON api.forms AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((((select auth.uid()))::text = user_id));
DROP POLICY IF EXISTS "Users can update own forms" ON api.forms;
CREATE POLICY "Users can update own forms" ON api.forms AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((user_id = ((select auth.jwt()) ->> 'user_id'::text)));
DROP POLICY IF EXISTS "Users can view own forms" ON api.forms;
CREATE POLICY "Users can view own forms" ON api.forms AS PERMISSIVE FOR SELECT TO PUBLIC USING ((user_id = ((select auth.jwt()) ->> 'user_id'::text)));
DROP POLICY IF EXISTS "Users can manage own tickets" ON public.support_tickets;
CREATE POLICY "Users can manage own tickets" ON public.support_tickets AS PERMISSIVE FOR ALL TO PUBLIC USING ((user_id = (( SELECT (select auth.uid()) AS uid))::text));
DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;
CREATE POLICY "Users can manage own notifications" ON public.notifications AS PERMISSIVE FOR ALL TO PUBLIC USING ((user_id = (( SELECT (select auth.uid()) AS uid))::text));
DROP POLICY IF EXISTS "Admins can manage faqs" ON public.faqs;
CREATE POLICY "Admins can manage faqs" ON public.faqs AS PERMISSIVE FOR ALL TO PUBLIC USING ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = (( SELECT (select auth.uid()) AS uid))::text) AND (users.role = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))))));
DROP POLICY IF EXISTS "Admins can view all anonymous users" ON public.anonymous_users;
CREATE POLICY "Admins can view all anonymous users" ON public.anonymous_users AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = ((select auth.uid()))::text) AND (users.role = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))))));
DROP POLICY IF EXISTS "Admins can view all forms" ON public.forms;
CREATE POLICY "Admins can view all forms" ON public.forms AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = (( SELECT (select auth.uid()) AS uid))::text) AND (users.role = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))))));
DROP POLICY IF EXISTS "Users can manage own forms" ON public.forms;
CREATE POLICY "Users can manage own forms" ON public.forms AS PERMISSIVE FOR ALL TO PUBLIC USING ((user_id = (( SELECT (select auth.uid()) AS uid))::text));
DROP POLICY IF EXISTS "Admins can view all form submissions" ON public.form_submissions;
CREATE POLICY "Admins can view all form submissions" ON public.form_submissions AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = (( SELECT (select auth.uid()) AS uid))::text) AND (users.role = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))))));
DROP POLICY IF EXISTS "Users can view form submissions" ON public.form_submissions;
CREATE POLICY "Users can view form submissions" ON public.form_submissions AS PERMISSIVE FOR SELECT TO PUBLIC USING (((user_id = (( SELECT (select auth.uid()) AS uid))::text) OR (form_id IN ( SELECT forms.id
   FROM forms
  WHERE (forms.user_id = (( SELECT (select auth.uid()) AS uid))::text)))));
DROP POLICY IF EXISTS "Users can update own auth mapping" ON public.firebase_auth_mapping;
CREATE POLICY "Users can update own auth mapping" ON public.firebase_auth_mapping AS PERMISSIVE FOR UPDATE TO PUBLIC USING (((firebase_uid = ((select auth.jwt()) ->> 'user_id'::text)) OR (supabase_user_id = (select auth.uid()))));
DROP POLICY IF EXISTS "Users can view own auth mapping" ON public.firebase_auth_mapping;
CREATE POLICY "Users can view own auth mapping" ON public.firebase_auth_mapping AS PERMISSIVE FOR SELECT TO PUBLIC USING (((firebase_uid = ((select auth.jwt()) ->> 'user_id'::text)) OR (supabase_user_id = (select auth.uid()))));
DROP POLICY IF EXISTS "Users can delete own tracking data" ON public.user_tracking;
CREATE POLICY "Users can delete own tracking data" ON public.user_tracking AS PERMISSIVE FOR DELETE TO PUBLIC USING (((firebase_uid = ((select auth.jwt()) ->> 'user_id'::text)) OR (supabase_user_id = (select auth.uid())) OR (fingerprint IN ( SELECT anonymous_users.fingerprint
   FROM anonymous_users
  WHERE (anonymous_users.fingerprint = user_tracking.fingerprint)))));
DROP POLICY IF EXISTS "Users can update own tracking data" ON public.user_tracking;
CREATE POLICY "Users can update own tracking data" ON public.user_tracking AS PERMISSIVE FOR UPDATE TO PUBLIC USING (((firebase_uid = ((select auth.jwt()) ->> 'user_id'::text)) OR (supabase_user_id = (select auth.uid())) OR (fingerprint IN ( SELECT anonymous_users.fingerprint
   FROM anonymous_users
  WHERE (anonymous_users.fingerprint = user_tracking.fingerprint)))));
DROP POLICY IF EXISTS "Users can view own tracking" ON public.user_tracking;
CREATE POLICY "Users can view own tracking" ON public.user_tracking AS PERMISSIVE FOR SELECT TO PUBLIC USING (((firebase_uid = ((select auth.jwt()) ->> 'user_id'::text)) OR (firebase_uid = ((select auth.uid()))::text)));
DROP POLICY IF EXISTS "Users can view own tracking data" ON public.user_tracking;
CREATE POLICY "Users can view own tracking data" ON public.user_tracking AS PERMISSIVE FOR SELECT TO PUBLIC USING (((firebase_uid = ((select auth.jwt()) ->> 'user_id'::text)) OR (supabase_user_id = (select auth.uid())) OR (fingerprint IN ( SELECT anonymous_users.fingerprint
   FROM anonymous_users
  WHERE (anonymous_users.fingerprint = user_tracking.fingerprint)))));
DROP POLICY IF EXISTS "Users can delete own drafts" ON public.form_drafts;
CREATE POLICY "Users can delete own drafts" ON public.form_drafts AS PERMISSIVE FOR DELETE TO PUBLIC USING (((user_id = ((select auth.uid()))::text) OR (session_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'session_id'::text)) OR (fingerprint = ((current_setting('request.jwt.claims'::text, true))::json ->> 'fingerprint'::text))));
DROP POLICY IF EXISTS "Users can insert own drafts" ON public.form_drafts;
CREATE POLICY "Users can insert own drafts" ON public.form_drafts AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (((user_id = ((select auth.uid()))::text) OR (session_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'session_id'::text)) OR (fingerprint = ((current_setting('request.jwt.claims'::text, true))::json ->> 'fingerprint'::text))));
DROP POLICY IF EXISTS "Users can update own drafts" ON public.form_drafts;
CREATE POLICY "Users can update own drafts" ON public.form_drafts AS PERMISSIVE FOR UPDATE TO PUBLIC USING (((user_id = ((select auth.uid()))::text) OR (session_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'session_id'::text)) OR (fingerprint = ((current_setting('request.jwt.claims'::text, true))::json ->> 'fingerprint'::text))));
DROP POLICY IF EXISTS "Users can view own drafts" ON public.form_drafts;
CREATE POLICY "Users can view own drafts" ON public.form_drafts AS PERMISSIVE FOR SELECT TO PUBLIC USING (((user_id = ((select auth.uid()))::text) OR (session_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'session_id'::text)) OR (fingerprint = ((current_setting('request.jwt.claims'::text, true))::json ->> 'fingerprint'::text))));
DROP POLICY IF EXISTS "Admins can view all payment intents" ON public.payment_intents;
CREATE POLICY "Admins can view all payment intents" ON public.payment_intents AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = ((select auth.uid()))::text) AND (users.role = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))))));
DROP POLICY IF EXISTS "Users can create payments" ON public.payment_intents;
CREATE POLICY "Users can create payments" ON public.payment_intents AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((user_id = ((select auth.jwt()) ->> 'user_id'::text)));
DROP POLICY IF EXISTS "Users can view own payments" ON public.payment_intents;
CREATE POLICY "Users can view own payments" ON public.payment_intents AS PERMISSIVE FOR SELECT TO PUBLIC USING ((user_id = ((select auth.jwt()) ->> 'user_id'::text)));
DROP POLICY IF EXISTS "Admins can view all form submissions" ON api.form_submissions;
CREATE POLICY "Admins can view all form submissions" ON api.form_submissions AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1
   FROM api.users
  WHERE ((users.id = ((select auth.uid()))::text) AND (users.role = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))))));
DROP POLICY IF EXISTS "Users can delete own form submissions" ON api.form_submissions;
CREATE POLICY "Users can delete own form submissions" ON api.form_submissions AS PERMISSIVE FOR DELETE TO PUBLIC USING ((((select auth.uid()))::text = user_id));
DROP POLICY IF EXISTS "Users can insert own form submissions" ON api.form_submissions;
CREATE POLICY "Users can insert own form submissions" ON api.form_submissions AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((((select auth.uid()))::text = user_id));
DROP POLICY IF EXISTS "Users can update own form submissions" ON api.form_submissions;
CREATE POLICY "Users can update own form submissions" ON api.form_submissions AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((((select auth.uid()))::text = user_id));
DROP POLICY IF EXISTS "Users can view form submissions" ON api.form_submissions;
CREATE POLICY "Users can view form submissions" ON api.form_submissions AS PERMISSIVE FOR SELECT TO PUBLIC USING (((form_id IN ( SELECT forms.id
   FROM api.forms
  WHERE (forms.user_id = ((select auth.jwt()) ->> 'user_id'::text)))) OR (submitted_by = ((select auth.jwt()) ->> 'user_id'::text))));
DROP POLICY IF EXISTS "Users can view own form submissions" ON api.form_submissions;
CREATE POLICY "Users can view own form submissions" ON api.form_submissions AS PERMISSIVE FOR SELECT TO PUBLIC USING ((((select auth.uid()))::text = user_id));
DROP POLICY IF EXISTS "Admins can view all payment intents" ON api.payment_intents;
CREATE POLICY "Admins can view all payment intents" ON api.payment_intents AS PERMISSIVE FOR SELECT TO PUBLIC USING ((EXISTS ( SELECT 1
   FROM api.users
  WHERE ((users.id = ((select auth.uid()))::text) AND (users.role = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))))));
DROP POLICY IF EXISTS "Users can create payments" ON api.payment_intents;
CREATE POLICY "Users can create payments" ON api.payment_intents AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((user_id = ((select auth.jwt()) ->> 'user_id'::text)));
DROP POLICY IF EXISTS "Users can delete own payment intents" ON api.payment_intents;
CREATE POLICY "Users can delete own payment intents" ON api.payment_intents AS PERMISSIVE FOR DELETE TO PUBLIC USING ((((select auth.uid()))::text = user_id));
DROP POLICY IF EXISTS "Users can insert own payment intents" ON api.payment_intents;
CREATE POLICY "Users can insert own payment intents" ON api.payment_intents AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((((select auth.uid()))::text = user_id));
DROP POLICY IF EXISTS "Users can update own payment intents" ON api.payment_intents;
CREATE POLICY "Users can update own payment intents" ON api.payment_intents AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((((select auth.uid()))::text = user_id));
DROP POLICY IF EXISTS "Users can view own payment intents" ON api.payment_intents;
CREATE POLICY "Users can view own payment intents" ON api.payment_intents AS PERMISSIVE FOR SELECT TO PUBLIC USING ((((select auth.uid()))::text = user_id));
DROP POLICY IF EXISTS "Users can view own payments" ON api.payment_intents;
CREATE POLICY "Users can view own payments" ON api.payment_intents AS PERMISSIVE FOR SELECT TO PUBLIC USING ((user_id = ((select auth.jwt()) ->> 'user_id'::text)));
DROP POLICY IF EXISTS "Users can update own auth mapping" ON api.firebase_auth_mapping;
CREATE POLICY "Users can update own auth mapping" ON api.firebase_auth_mapping AS PERMISSIVE FOR UPDATE TO PUBLIC USING (((firebase_uid = ((select auth.jwt()) ->> 'user_id'::text)) OR (supabase_user_id = (select auth.uid()))));
DROP POLICY IF EXISTS "Users can view own auth mapping" ON api.firebase_auth_mapping;
CREATE POLICY "Users can view own auth mapping" ON api.firebase_auth_mapping AS PERMISSIVE FOR SELECT TO PUBLIC USING (((firebase_uid = ((select auth.jwt()) ->> 'user_id'::text)) OR (supabase_user_id = (select auth.uid()))));
DROP POLICY IF EXISTS "Users can delete own tracking data" ON api.user_tracking;
CREATE POLICY "Users can delete own tracking data" ON api.user_tracking AS PERMISSIVE FOR DELETE TO PUBLIC USING (((firebase_uid = ((select auth.jwt()) ->> 'user_id'::text)) OR (supabase_user_id = (select auth.uid())) OR (fingerprint IN ( SELECT anonymous_users.fingerprint
   FROM api.anonymous_users
  WHERE (anonymous_users.fingerprint = user_tracking.fingerprint)))));
DROP POLICY IF EXISTS "Users can update own tracking data" ON api.user_tracking;
CREATE POLICY "Users can update own tracking data" ON api.user_tracking AS PERMISSIVE FOR UPDATE TO PUBLIC USING (((firebase_uid = ((select auth.jwt()) ->> 'user_id'::text)) OR (supabase_user_id = (select auth.uid())) OR (fingerprint IN ( SELECT anonymous_users.fingerprint
   FROM api.anonymous_users
  WHERE (anonymous_users.fingerprint = user_tracking.fingerprint)))));
DROP POLICY IF EXISTS "Users can view own tracking data" ON api.user_tracking;
CREATE POLICY "Users can view own tracking data" ON api.user_tracking AS PERMISSIVE FOR SELECT TO PUBLIC USING (((firebase_uid = ((select auth.jwt()) ->> 'user_id'::text)) OR (supabase_user_id = (select auth.uid())) OR (fingerprint IN ( SELECT anonymous_users.fingerprint
   FROM api.anonymous_users
  WHERE (anonymous_users.fingerprint = user_tracking.fingerprint)))));
DROP POLICY IF EXISTS "Allow anonymous user tracking" ON api.anonymous_users;
CREATE POLICY "Allow anonymous user tracking" ON api.anonymous_users AS PERMISSIVE FOR ALL TO PUBLIC USING (1=1);
DROP POLICY IF EXISTS "Anyone can view form templates" ON public.form_templates;
CREATE POLICY "Anyone can view form templates" ON public.form_templates AS PERMISSIVE FOR SELECT TO PUBLIC USING (1=1);
DROP POLICY IF EXISTS "Anyone can view templates" ON public.form_templates;
CREATE POLICY "Anyone can view templates" ON public.form_templates AS PERMISSIVE FOR SELECT TO PUBLIC USING (1=1);
DROP POLICY IF EXISTS "Service and anonymous users can manage tracking" ON public.anonymous_users;
CREATE POLICY "Service and anonymous users can manage tracking" ON public.anonymous_users AS PERMISSIVE FOR ALL TO PUBLIC USING (1=1);
DROP POLICY IF EXISTS "Anonymous users can create forms" ON public.forms;
CREATE POLICY "Anonymous users can create forms" ON public.forms AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (1=1);
DROP POLICY IF EXISTS "Anonymous users can view forms by fingerprint" ON public.forms;
CREATE POLICY "Anonymous users can view forms by fingerprint" ON public.forms AS PERMISSIVE FOR SELECT TO PUBLIC USING (1=1);
DROP POLICY IF EXISTS "Anyone can submit forms" ON public.form_submissions;
CREATE POLICY "Anyone can submit forms" ON public.form_submissions AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (1=1);
DROP POLICY IF EXISTS "Anyone can submit to forms" ON public.form_submissions;
CREATE POLICY "Anyone can submit to forms" ON public.form_submissions AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (1=1);
DROP POLICY IF EXISTS "Allow auth mapping insertion" ON public.firebase_auth_mapping;
CREATE POLICY "Allow auth mapping insertion" ON public.firebase_auth_mapping AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (1=1);
DROP POLICY IF EXISTS "Allow tracking data insertion" ON public.user_tracking;
CREATE POLICY "Allow tracking data insertion" ON public.user_tracking AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (1=1);
DROP POLICY IF EXISTS "Service can manage user tracking" ON public.user_tracking;
CREATE POLICY "Service can manage user tracking" ON public.user_tracking AS PERMISSIVE FOR ALL TO PUBLIC USING (1=1);
DROP POLICY IF EXISTS "Anyone can submit forms" ON api.form_submissions;
CREATE POLICY "Anyone can submit forms" ON api.form_submissions AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (1=1);
DROP POLICY IF EXISTS "Allow auth mapping insertion" ON api.firebase_auth_mapping;
CREATE POLICY "Allow auth mapping insertion" ON api.firebase_auth_mapping AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (1=1);
DROP POLICY IF EXISTS "Allow tracking data insertion" ON api.user_tracking;
CREATE POLICY "Allow tracking data insertion" ON api.user_tracking AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (1=1);