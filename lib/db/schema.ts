import { pgTable, text, timestamp, uuid, boolean, integer, jsonb, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'super_admin'])
export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'suspended', 'pending'])
export const formStatusEnum = pgEnum('form_status', ['draft', 'published', 'archived', 'deleted'])
export const submissionStatusEnum = pgEnum('submission_status', ['pending', 'approved', 'rejected', 'spam'])
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded', 'cancelled'])
export const ticketStatusEnum = pgEnum('ticket_status', ['open', 'in_progress', 'resolved', 'closed'])
export const ticketPriorityEnum = pgEnum('ticket_priority', ['low', 'medium', 'high', 'urgent'])
export const ticketCategoryEnum = pgEnum('ticket_category', ['technical', 'billing', 'feature_request', 'bug_report', 'general', 'demo_request'])
export const notificationTypeEnum = pgEnum('notification_type', ['ticket_created', 'ticket_updated', 'ticket_resolved', 'system_alert', 'user_registration', 'form_submission'])
export const notificationStatusEnum = pgEnum('notification_status', ['unread', 'read', 'archived'])

// Users table - uses Firebase UID as primary key
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Firebase UID
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'), // Nullable for Firebase users
  firstName: text('first_name'),
  lastName: text('last_name'),
  phoneNumber: text('phone_number'),
  countryCode: text('country_code'),
  role: userRoleEnum('role').default('user').notNull(),
  status: userStatusEnum('status').default('active').notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  emailVerificationToken: text('email_verification_token'),
  passwordResetToken: text('password_reset_token'),
  passwordResetExpires: timestamp('password_reset_expires'),
  lastLoginAt: timestamp('last_login_at'),
  stripeCustomerId: text('stripe_customer_id'),
  subscriptionTier: text('subscription_tier').default('free').notNull(),
  subscriptionStatus: text('subscription_status').default('inactive').notNull(),
  subscriptionExpiresAt: timestamp('subscription_expires_at'),
  settings: jsonb('settings').default({}),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// User profiles table
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  avatar: text('avatar'),
  bio: text('bio'),
  company: text('company'),
  website: text('website'),
  phone: text('phone'),
  address: jsonb('address'),
  timezone: text('timezone'),
  language: text('language').default('en').notNull(),
  preferences: jsonb('preferences').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Forms table
export const forms = pgTable('forms', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  slug: text('slug').notNull().unique(),
  status: formStatusEnum('status').default('draft').notNull(),
  isPublic: boolean('is_public').default(false).notNull(),
  allowAnonymous: boolean('allow_anonymous').default(true).notNull(),
  requireCaptcha: boolean('require_captcha').default(false).notNull(),
  maxSubmissions: integer('max_submissions'),
  submissionLimit: integer('submission_limit'),
  submissionCount: integer('submission_count').default(0).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  settings: jsonb('settings').default({}),
  geoRestrictions: jsonb('geo_restrictions').default({}),
  theme: jsonb('theme').default({}),
  brandKit: jsonb('brand_kit').default({}),
  isPublished: boolean('is_published').default(false).notNull(),
  publishedUrl: text('published_url'),
  publishedAt: timestamp('published_at'),
  expiresAt: timestamp('expires_at'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Form fields table
export const formFields = pgTable('form_fields', {
  id: uuid('id').defaultRandom().primaryKey(),
  formId: uuid('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  label: text('label').notNull(),
  placeholder: text('placeholder'),
  required: boolean('required').default(false).notNull(),
  validation: jsonb('validation'),
  options: jsonb('options'),
  order: integer('order').notNull(),
  settings: jsonb('settings').default({}),
  conditionalLogic: jsonb('conditional_logic'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Form submissions table
export const formSubmissions = pgTable('form_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  formId: uuid('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  sessionId: text('session_id'), // For anonymous users
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  referrer: text('referrer'),
  status: submissionStatusEnum('status').default('pending').notNull(),
  isSpam: boolean('is_spam').default(false).notNull(),
  spamScore: integer('spam_score'),
  data: jsonb('data').notNull(),
  metadata: jsonb('metadata').default({}),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Payment intents table
export const paymentIntents = pgTable('payment_intents', {
  id: uuid('id').defaultRandom().primaryKey(),
  stripePaymentIntentId: text('stripe_payment_intent_id').notNull().unique(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  amount: integer('amount').notNull(), // Amount in cents
  currency: text('currency').default('usd').notNull(),
  status: paymentStatusEnum('status').default('pending').notNull(),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Anonymous users table for tracking guest users
export const anonymousUsers = pgTable('anonymous_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  fingerprint: text('fingerprint').notNull().unique(),
  sessionData: jsonb('session_data').default({}),
  formCount: integer('form_count').default(0).notNull(),
  lastSeen: timestamp('last_seen').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Form templates table
export const formTemplates = pgTable('form_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  thumbnail: text('thumbnail'),
  templateData: jsonb('template_data').notNull(),
  usageCount: integer('usage_count').default(0).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// User tracking table for analytics
export const userTracking = pgTable('user_tracking', {
  id: uuid('id').defaultRandom().primaryKey(),
  fingerprint: text('fingerprint').notNull().unique(),
  ipAddress: text('ip_address').notNull(),
  userAgent: text('user_agent'),
  firstVisit: timestamp('first_visit').defaultNow().notNull(),
  lastVisit: timestamp('last_visit').defaultNow().notNull(),
  visitCount: integer('visit_count').default(1).notNull(),
  firebaseUid: text('firebase_uid'), // Nullable, filled when user authenticates
  country: text('country'),
  region: text('region'),
  city: text('city'),
  timezone: text('timezone'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Firebase auth mapping table
export const firebaseAuthMapping = pgTable('firebase_auth_mapping', {
  id: uuid('id').defaultRandom().primaryKey(),
  firebaseUid: text('firebase_uid').notNull().unique(),
  supabaseUuid: uuid('supabase_uuid').defaultRandom().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// FAQ table
export const faqs = pgTable('faqs', {
  id: uuid('id').defaultRandom().primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: text('category').notNull().default('general'),
  order: integer('order').notNull().default(0),
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: text('created_by').references(() => users.id),
  updatedBy: text('updated_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Support tickets table
export const supportTickets = pgTable('support_tickets', {
  id: uuid('id').defaultRandom().primaryKey(),
  ticketNumber: text('ticket_number').notNull().unique(),
  userId: text('user_id').references(() => users.id),
  userEmail: text('user_email').notNull(),
  userName: text('user_name'),
  subject: text('subject').notNull(),
  description: text('description').notNull(),
  category: ticketCategoryEnum('category').default('general').notNull(),
  priority: ticketPriorityEnum('priority').default('medium').notNull(),
  status: ticketStatusEnum('status').default('open').notNull(),
  assignedTo: text('assigned_to').references(() => users.id),
  tags: jsonb('tags').default([]),
  attachments: jsonb('attachments').default([]),
  metadata: jsonb('metadata').default({}),
  resolvedAt: timestamp('resolved_at'),
  closedAt: timestamp('closed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Support ticket messages/comments
export const ticketMessages = pgTable('ticket_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  ticketId: uuid('ticket_id').notNull().references(() => supportTickets.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id),
  userEmail: text('user_email'),
  userName: text('user_name'),
  message: text('message').notNull(),
  isInternal: boolean('is_internal').default(false).notNull(),
  attachments: jsonb('attachments').default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => users.id),
  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  status: notificationStatusEnum('status').default('unread').notNull(),
  data: jsonb('data').default({}),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Form drafts table for save and resume functionality
export const formDrafts = pgTable('form_drafts', {
  id: uuid('id').defaultRandom().primaryKey(),
  formId: uuid('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  sessionId: text('session_id'), // For anonymous users
  fingerprint: text('fingerprint'), // Device fingerprint for anonymous users
  draftData: jsonb('draft_data').notNull(), // Partial form data
  progressData: jsonb('progress_data').default({}), // Field completion tracking
  lastAccessedAt: timestamp('last_accessed_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// System analytics table for storing aggregated metrics
export const systemAnalytics = pgTable('system_analytics', {
  id: uuid('id').defaultRandom().primaryKey(),
  date: timestamp('date').notNull(),
  metric: text('metric').notNull(),
  value: integer('value').notNull(),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  forms: many(forms),
  formSubmissions: many(formSubmissions),
  paymentIntents: many(paymentIntents),
  supportTickets: many(supportTickets),
  assignedTickets: many(supportTickets, { relationName: 'assignedTickets' }),
  ticketMessages: many(ticketMessages),
  notifications: many(notifications),
}))

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}))

export const formsRelations = relations(forms, ({ one, many }) => ({
  user: one(users, {
    fields: [forms.userId],
    references: [users.id],
  }),
  fields: many(formFields),
  submissions: many(formSubmissions),
}))

export const formFieldsRelations = relations(formFields, ({ one }) => ({
  form: one(forms, {
    fields: [formFields.formId],
    references: [forms.id],
  }),
}))

export const formSubmissionsRelations = relations(formSubmissions, ({ one }) => ({
  form: one(forms, {
    fields: [formSubmissions.formId],
    references: [forms.id],
  }),
  user: one(users, {
    fields: [formSubmissions.userId],
    references: [users.id],
  }),
}))

export const paymentIntentsRelations = relations(paymentIntents, ({ one }) => ({
  user: one(users, {
    fields: [paymentIntents.userId],
    references: [users.id],
  }),
}))

export const faqsRelations = relations(faqs, ({ one }) => ({
  creator: one(users, {
    fields: [faqs.createdBy],
    references: [users.id],
  }),
  updater: one(users, {
    fields: [faqs.updatedBy],
    references: [users.id],
  }),
}))

export const supportTicketsRelations = relations(supportTickets, ({ one, many }) => ({
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id],
  }),
  assignedUser: one(users, {
    fields: [supportTickets.assignedTo],
    references: [users.id],
    relationName: 'assignedTickets',
  }),
  messages: many(ticketMessages),
}))

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(supportTickets, {
    fields: [ticketMessages.ticketId],
    references: [supportTickets.id],
  }),
  user: one(users, {
    fields: [ticketMessages.userId],
    references: [users.id],
  }),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}))

export const formDraftsRelations = relations(formDrafts, ({ one }) => ({
  form: one(forms, {
    fields: [formDrafts.formId],
    references: [forms.id],
  }),
  user: one(users, {
    fields: [formDrafts.userId],
    references: [users.id],
  }),
}))

// Export all tables for use in other files
export const schema = {
  users,
  userProfiles,
  forms,
  formFields,
  formSubmissions,
  formDrafts,
  paymentIntents,
  anonymousUsers,
  formTemplates,
  userTracking,
  firebaseAuthMapping,
  faqs,
  supportTickets,
  ticketMessages,
  notifications,
  systemAnalytics,
}
