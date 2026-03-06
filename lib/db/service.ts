import { db } from './index'
import {
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
  systemAnalytics
} from './schema'
import { eq, and, desc, count, sql, inArray } from 'drizzle-orm'

async function withRetry<T>(fn: () => Promise<T>, label: string, retries = 3, baseDelayMs = 300): Promise<T> {
  let attempt = 0
  let lastError: any
  while (attempt <= retries) {
    try {
      return await fn()
    } catch (err: any) {
      lastError = err
      const code = err?.code || err?.errno || err?.message
      // Only retry on transient network/connection issues
      const isTransient = typeof code === 'string' && (
        code.includes('CONNECT_TIMEOUT') ||
        code.includes('write ECONNRESET') ||
        code.includes('ETIMEDOUT') ||
        code.includes('ECONNREFUSED')
      )
      if (!isTransient || attempt === retries) break
      const delay = baseDelayMs * Math.pow(2, attempt)
      await new Promise(res => setTimeout(res, delay))
      attempt += 1
    }
  }
  throw lastError
}
import { Database } from '@/types/supabase'

// Database service using Drizzle ORM
export const dbService = {
  // Users
  async createUser(user: {
    id: string
    email: string
    firstName?: string | null
    lastName?: string | null
    phoneNumber?: string | null
    countryCode?: string | null
    avatar?: string | null
    role?: string
    status?: string
    emailVerified?: boolean
  }) {
    const [newUser] = await db.insert(users).values({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      countryCode: user.countryCode,
      role: (user.role as 'user' | 'admin' | 'super_admin') || 'user',
      status: (user.status as 'active' | 'inactive' | 'suspended' | 'pending') || 'active',
      emailVerified: user.emailVerified || true,
    }).returning()

    // Create user profile
    await db.insert(userProfiles).values({
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return newUser
  },

  async getUser(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        profile: true,
      },
    })
    return user
  },

  async getUserByEmail(email: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      with: {
        profile: true,
      },
    })
    return user
  },

  async updateUser(userId: string, updates: {
    email?: string
    firstName?: string
    lastName?: string
    phoneNumber?: string
    countryCode?: string
    avatar?: string
    bio?: string
    company?: string
    website?: string
    phone?: string
    timezone?: string
    language?: string
    subscriptionTier?: string
    subscriptionStatus?: string
    subscriptionExpiresAt?: Date
    stripeCustomerId?: string
    role?: string
    status?: string
  }) {
    // Separate user and profile updates
    const userData: any = {}
    const profileData: any = {}

    if (updates.email !== undefined) userData.email = updates.email
    if (updates.firstName !== undefined) userData.firstName = updates.firstName
    if (updates.lastName !== undefined) userData.lastName = updates.lastName
    if (updates.phoneNumber !== undefined) userData.phoneNumber = updates.phoneNumber
    if (updates.countryCode !== undefined) userData.countryCode = updates.countryCode
    if (updates.subscriptionTier !== undefined) userData.subscriptionTier = updates.subscriptionTier
    if (updates.subscriptionStatus !== undefined) userData.subscriptionStatus = updates.subscriptionStatus
    if (updates.subscriptionExpiresAt !== undefined) userData.subscriptionExpiresAt = updates.subscriptionExpiresAt
    if (updates.stripeCustomerId !== undefined) userData.stripeCustomerId = updates.stripeCustomerId
    if (updates.role !== undefined) userData.role = updates.role
    if (updates.status !== undefined) userData.status = updates.status

    if (updates.bio !== undefined) profileData.bio = updates.bio
    if (updates.company !== undefined) profileData.company = updates.company
    if (updates.website !== undefined) profileData.website = updates.website
    if (updates.phone !== undefined) profileData.phone = updates.phone
    if (updates.timezone !== undefined) profileData.timezone = updates.timezone
    if (updates.language !== undefined) profileData.language = updates.language

    let userResult = null
    if (Object.keys(userData).length > 0) {
      userData.updatedAt = new Date()
      const [updatedUser] = await db.update(users)
        .set(userData)
        .where(eq(users.id, userId))
        .returning()
      userResult = updatedUser
    }

    if (Object.keys(profileData).length > 0) {
      profileData.updatedAt = new Date()
      await db.update(userProfiles)
        .set(profileData)
        .where(eq(userProfiles.userId, userId))
    }

    return userResult
  },

  // Forms
  async createForm(form: {
    title: string
    description?: string
    slug: string
    userId: string
    status?: 'draft' | 'published' | 'archived' | 'deleted'
    isPublic?: boolean
    allowAnonymous?: boolean
    requireCaptcha?: boolean
    maxSubmissions?: number | null
    submissionLimit?: number | null
    settings?: any
    theme?: any
    brandKit?: any
    fields?: any[] // Add fields support
  }) {
    // Ensure a valid user exists for the provided userId to satisfy FK
    // If the user doesn't exist (e.g., anonymous via fingerprint), create a placeholder user
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, form.userId),
    })

    if (!existingUser) {
      // Create a minimal anonymous user with a placeholder email
      // Email must be unique and not null per schema
      const placeholderEmail = `anon+${form.userId}@local.invalid`
      await db.insert(users).values({
        id: form.userId,
        email: placeholderEmail,
        // other columns rely on defaults
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    // Extract fields from form data
    const { fields, ...formData } = form

    // Create the form
    const [newForm] = await db.insert(forms).values({
      ...formData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()

    // Handle fields if provided
    if (fields && Array.isArray(fields) && fields.length > 0) {
      console.log('🔄 Creating fields for new form:', newForm.id, 'with', fields.length, 'fields')

      const fieldsToInsert = fields.map((field: any, index: number) => ({
        // Don't specify id - let database generate UUID
        formId: newForm.id,
        type: field.type,
        label: field.label,
        placeholder: field.placeholder || null,
        required: field.required || false,
        validation: field.validation || null,
        options: field.options || null,
        order: field.order !== undefined ? field.order : index,
        settings: field.settings || {},
        conditionalLogic: field.conditional_logic || field.conditionalLogic || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      const insertedFields = await db.insert(formFields).values(fieldsToInsert).returning()
      console.log('✅ Fields created for new form:', newForm.id, 'with database-generated IDs:', insertedFields.map(f => f.id))

      // Return the form with the new field IDs
      return {
        ...newForm,
        fields: insertedFields
      }
    }

    return newForm
  },

  async getForm(formId: string) {
    // If the ID looks like a UUID, query by id; otherwise, try slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(formId)
    if (isUuid) {
      const form = await db.query.forms.findFirst({
        where: eq(forms.id, formId),
        with: {
          fields: {
            orderBy: [formFields.order],
          },
        },
      })
      return form
    }
    return await this.getFormBySlug(formId)
  },

  async getFormBySlug(slug: string) {
    const form = await db.query.forms.findFirst({
      where: eq(forms.slug, slug),
      with: {
        fields: {
          orderBy: [formFields.order],
        },
      },
    })
    return form
  },

  async updateForm(formId: string, updates: any) {
    console.log('🔧 Database updateForm called with:', { formId, updates })

    // Extract fields from updates if present
    const { fields, ...formUpdates } = updates

    // Update the form itself
    formUpdates.updatedAt = new Date()
    const [updatedForm] = await db.update(forms)
      .set(formUpdates)
      .where(eq(forms.id, formId))
      .returning()

    // Handle field updates if fields are provided
    if (fields && Array.isArray(fields)) {
      console.log('🔄 Updating fields for form:', formId, 'with', fields.length, 'fields')

      // Get existing fields to compare
      const existingFields = await db.query.formFields.findMany({
        where: eq(formFields.formId, formId),
        orderBy: [formFields.order],
      })

      // Create a map of existing fields by their ID for accurate comparison
      const existingFieldsById = new Map()
      existingFields.forEach(field => {
        existingFieldsById.set(field.id, field)
      })

      // Determine which fields are new, updated, or unchanged
      // @ts-ignore - TypeScript inference issues with array operations
      const fieldsToInsert: any[] = []
      // @ts-ignore - TypeScript inference issues with array operations  
      const fieldsToUpdate: any[] = []
      // @ts-ignore - TypeScript inference issues with array operations
      const fieldsToDelete: string[] = []

      // Track which field IDs are in the incoming data
      const incomingFieldIds = new Set()

      // Check each incoming field
      fields.forEach((field: any, index: number) => {
        const order = field.order !== undefined ? field.order : index

        // If field has an ID, check if it exists in the database
        if (field.id && existingFieldsById.has(field.id)) {
          const existingField = existingFieldsById.get(field.id)
          incomingFieldIds.add(field.id)

          // Field exists - check if it needs updating
          const hasChanges = (
            existingField.type !== field.type ||
            existingField.label !== field.label ||
            existingField.placeholder !== (field.placeholder || null) ||
            existingField.required !== (field.required || false) ||
            existingField.order !== order ||
            JSON.stringify(existingField.validation) !== JSON.stringify(field.validation || null) ||
            JSON.stringify(existingField.options) !== JSON.stringify(field.options || null) ||
            JSON.stringify(existingField.settings) !== JSON.stringify(field.settings || {}) ||
            JSON.stringify(existingField.conditionalLogic) !== JSON.stringify(field.conditional_logic || field.conditionalLogic || null)
          )

          if (hasChanges) {
            fieldsToUpdate.push({
              id: existingField.id, // Keep the existing UUID
              formId: formId,
              type: field.type,
              label: field.label,
              placeholder: field.placeholder || null,
              required: field.required || false,
              validation: field.validation || null,
              options: field.options || null,
              order: order,
              settings: field.settings || {},
              conditionalLogic: field.conditional_logic || field.conditionalLogic || null,
              updatedAt: new Date(),
            })
          }
          // If no changes, keep the existing field as-is
        } else {
          // New field (no ID or ID doesn't exist in database) - insert with database-generated UUID
          fieldsToInsert.push({
            formId: formId,
            type: field.type,
            label: field.label,
            placeholder: field.placeholder || null,
            required: field.required || false,
            validation: field.validation || null,
            options: field.options || null,
            order: order,
            settings: field.settings || {},
            conditionalLogic: field.conditional_logic || field.conditionalLogic || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        }
      })

      // Find fields to delete (existing fields not in the incoming list)
      existingFields.forEach(existingField => {
        if (!incomingFieldIds.has(existingField.id)) {
          fieldsToDelete.push(existingField.id)
        }
      })

      console.log('📊 Field update analysis:', {
        toInsert: fieldsToInsert.length,
        toUpdate: fieldsToUpdate.length,
        toDelete: fieldsToDelete.length,
        total: fields.length,
        existingFields: existingFields.length,
        incomingFieldIds: Array.from(incomingFieldIds),
        fieldsToDeleteIds: fieldsToDelete
      })

      // Delete fields that are no longer needed
      if (fieldsToDelete.length > 0) {
        await db.delete(formFields).where(inArray(formFields.id, fieldsToDelete as string[]))
        console.log('🗑️ Deleted', fieldsToDelete.length, 'fields')
      }

      // Insert new fields
      if (fieldsToInsert.length > 0) {
        const insertedFields = await db.insert(formFields).values(fieldsToInsert as any[]).returning()
        console.log('➕ Inserted', insertedFields.length, 'new fields with IDs:', insertedFields.map(f => f.id))
      }

      // Update changed fields
      if (fieldsToUpdate.length > 0) {
        for (const fieldUpdate of fieldsToUpdate as any[]) {
          await db.update(formFields)
            .set(fieldUpdate)
            .where(eq(formFields.id, fieldUpdate.id))
        }
        console.log('🔄 Updated', fieldsToUpdate.length, 'existing fields')
      }

      // Get the final state of all fields
      const finalFields = await db.query.formFields.findMany({
        where: eq(formFields.formId, formId),
        orderBy: [formFields.order],
      })

      console.log('✅ Fields updated for form:', formId, 'final field IDs:', finalFields.map(f => f.id))

      // Return the updated form with the final field state
      return {
        ...updatedForm,
        fields: finalFields
      }
    }

    console.log('✅ Database form updated:', updatedForm)
    return updatedForm
  },

  async deleteForm(formId: string) {
    await db.delete(forms).where(eq(forms.id, formId))
  },

  async getUserForms(userId: string) {
    const userForms = await withRetry(() => db.query.forms.findMany({
      where: eq(forms.userId, userId),
      with: {
        fields: {
          orderBy: [formFields.order],
        },
        submissions: {
          orderBy: [desc(formSubmissions.submittedAt)],
        },
      },
      orderBy: [desc(forms.updatedAt)],
    }), 'getUserForms')

    // Manually limit submissions to avoid potential issues with relation limits
    return userForms.map(form => ({
      ...form,
      submissions: form.submissions ? form.submissions.slice(0, 10) : []
    }))
  },

  async getUserFormsSummary(userId: string) {
    const userForms = await withRetry(() => db.query.forms.findMany({
      where: eq(forms.userId, userId),
      orderBy: [desc(forms.updatedAt)],
    }), 'getUserFormsSummary')

    return userForms
  },

  // Form Fields
  async createFormField(field: {
    formId: string
    type: string
    label: string
    placeholder?: string | null
    required?: boolean
    validation?: any
    options?: any
    order: number
    settings?: any
    conditionalLogic?: any
  }) {
    const [newField] = await db.insert(formFields).values({
      ...field,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()
    return newField
  },

  async getFormFields(formId: string) {
    const fields = await db.query.formFields.findMany({
      where: eq(formFields.formId, formId),
      orderBy: [formFields.order],
    })
    return fields
  },

  async updateFormField(fieldId: string, updates: {
    type?: string
    label?: string
    placeholder?: string | null
    required?: boolean
    validation?: any
    options?: any
    order?: number
    settings?: any
    conditionalLogic?: any
  }) {
    const [updatedField] = await db.update(formFields)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(formFields.id, fieldId))
      .returning()
    return updatedField
  },

  async deleteFormField(fieldId: string) {
    await db.delete(formFields).where(eq(formFields.id, fieldId))
  },

  // Form Submissions
  async createFormSubmission(submission: {
    formId: string
    userId?: string | null
    sessionId?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    referrer?: string | null
    status?: 'pending' | 'approved' | 'rejected' | 'spam'
    isSpam?: boolean
    spamScore?: number | null
    data: any
    metadata?: any
    submittedAt?: Date
  }) {
    const [newSubmission] = await db.insert(formSubmissions).values({
      ...submission,
      submittedAt: submission.submittedAt || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()
    return newSubmission
  },

  async updateFormSubmission(id: string, updates: any) {
    const [updatedSubmission] = await db.update(formSubmissions)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(formSubmissions.id, id))
      .returning()
    return updatedSubmission
  },

  async getFormSubmissions(formId: string) {
    const submissions = await db.query.formSubmissions.findMany({
      where: eq(formSubmissions.formId, formId),
      orderBy: [desc(formSubmissions.createdAt)],
    })
    return submissions
  },

  async getUserFormSubmissions(userId: string) {
    const submissions = await db.query.formSubmissions.findMany({
      where: eq(formSubmissions.userId, userId),
      orderBy: [desc(formSubmissions.createdAt)],
    })
    return submissions
  },

  // Anonymous Users
  async createAnonymousUser(anonymousData: {
    fingerprint: string
    sessionData?: any
    ipAddress?: string
    userAgent?: string
  }) {
    try {
      // Try insert; on conflict (same fingerprint) do nothing so we can fetch existing
      const [maybeInserted] = await db
        .insert(anonymousUsers)
        .values({
          ...anonymousData,
          lastSeen: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoNothing({ target: anonymousUsers.fingerprint })
        .returning()

      if (maybeInserted) {
        return maybeInserted
      }

      // Conflict occurred, fetch and return existing
      return await this.getAnonymousUser(anonymousData.fingerprint)
    } catch (error: any) {
      // As a fallback, if a duplicate error still bubbles up, fetch existing
      if (error?.code === '23505' || (typeof error?.message === 'string' && error.message.includes('anonymous_users') && error.message.includes('duplicate'))) {
        return await this.getAnonymousUser(anonymousData.fingerprint)
      }
      throw error
    }
  },

  async getAnonymousUser(fingerprint: string) {
    const anonymousUser = await db.query.anonymousUsers.findFirst({
      where: eq(anonymousUsers.fingerprint, fingerprint),
    })
    return anonymousUser
  },

  async updateAnonymousUser(fingerprint: string, updates: any) {
    // Fetch existing record to safely merge JSON fields and avoid invalid columns
    const existing = await db.query.anonymousUsers.findFirst({
      where: eq(anonymousUsers.fingerprint, fingerprint),
    })

    const safeUpdate: any = {
      updatedAt: new Date(),
    }

    // Map external fields to schema columns
    if (typeof updates?.formCount === 'number') {
      safeUpdate.formCount = updates.formCount
    }
    if (updates?.last_visit) {
      const dateVal = new Date(updates.last_visit)
      if (!isNaN(dateVal.getTime())) {
        safeUpdate.lastSeen = dateVal
      }
    } else {
      // If last_visit not provided, still refresh lastSeen
      safeUpdate.lastSeen = new Date()
    }

    // Merge sessionData JSON with any transient values like last_ip, user_agent
    let mergedSessionData: any = existing?.sessionData || {}
    if (updates?.last_ip) {
      mergedSessionData = { ...mergedSessionData, last_ip: updates.last_ip }
    }
    if (updates?.user_agent) {
      mergedSessionData = { ...mergedSessionData, user_agent: updates.user_agent }
    }
    if (Object.keys(mergedSessionData || {}).length > 0) {
      safeUpdate.sessionData = mergedSessionData
    }

    // If record doesn't exist yet, create it instead of failing
    if (!existing) {
      const [newAnonymousUser] = await db.insert(anonymousUsers).values({
        fingerprint,
        sessionData: safeUpdate.sessionData || {},
        formCount: typeof safeUpdate.formCount === 'number' ? safeUpdate.formCount : 0,
        lastSeen: safeUpdate.lastSeen || new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning()
      return newAnonymousUser
    }

    const [updatedUser] = await db.update(anonymousUsers)
      .set(safeUpdate)
      .where(eq(anonymousUsers.fingerprint, fingerprint))
      .returning()
    return updatedUser
  },

  async deleteUser(userId: string) {
    try {
      // Delete user (cascade will handle related data)
      await db.delete(users).where(eq(users.id, userId))
      return true
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error)
      throw error
    }
  },

  async canAnonymousUserCreateForm(fingerprint: string): Promise<{ canCreate: boolean; currentCount: number; limit: number }> {
    const anonymousUser = await this.getAnonymousUser(fingerprint)
    if (!anonymousUser) {
      await this.createAnonymousUser({ fingerprint })
      return { canCreate: true, currentCount: 0, limit: 5 }
    }

    // Get anonymous user's published forms count dynamically
    const userForms = await db.select().from(forms).where(eq(forms.userId, fingerprint))
    const publishedForms = userForms.filter(form => form.status === 'published')

    const currentCount = publishedForms.length
    const limit = 5 // Anonymous users limited to 5 published forms

    return {
      canCreate: currentCount < limit,
      currentCount,
      limit
    }
  },

  async canUserCreateForm(userId: string): Promise<{ canCreate: boolean; currentCount: number; limit: number }> {
    // Get user's published forms count
    const userForms = await db.select().from(forms).where(eq(forms.userId, userId))
    const publishedForms = userForms.filter(form => form.status === 'published')

    const currentCount = publishedForms.length
    const limit = 5 // Free users limited to 5 published forms

    return {
      canCreate: currentCount < limit,
      currentCount,
      limit
    }
  },

  async getAnonymousUserFormCount(fingerprint: string): Promise<{ currentCount: number; limit: number; remaining: number }> {
    const anonymousUser = await this.getAnonymousUser(fingerprint)
    if (!anonymousUser) {
      return { currentCount: 0, limit: 5, remaining: 5 }
    }

    // Get anonymous user's published forms count dynamically
    const userForms = await db.select().from(forms).where(eq(forms.userId, fingerprint))
    const publishedForms = userForms.filter(form => form.status === 'published')

    const currentCount = publishedForms.length
    const limit = 5
    const remaining = Math.max(0, limit - currentCount)

    return { currentCount, limit, remaining }
  },

  async incrementAnonymousUserFormCount(fingerprint: string) {
    const [updatedUser] = await db.update(anonymousUsers)
      .set({
        formCount: sql`${anonymousUsers.formCount} + 1`,
        lastSeen: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(anonymousUsers.fingerprint, fingerprint))
      .returning()
    return updatedUser
  },

  // Payment Intents
  async createPaymentIntent(paymentData: {
    stripePaymentIntentId: string
    userId?: string | null
    amount: number
    currency?: string
    status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
    metadata?: any
  }) {
    const [newPaymentIntent] = await db.insert(paymentIntents).values({
      ...paymentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()
    return newPaymentIntent
  },

  async updatePaymentIntent(stripeId: string, updates: any) {
    updates.updatedAt = new Date()
    const [updatedPaymentIntent] = await db.update(paymentIntents)
      .set(updates)
      .where(eq(paymentIntents.stripePaymentIntentId, stripeId))
      .returning()
    return updatedPaymentIntent
  },

  // Form Templates
  async getTemplates() {
    const templates = await db.query.formTemplates.findMany({
      orderBy: [desc(formTemplates.createdAt)],
    })
    return templates
  },

  async getTemplate(id: string) {
    const template = await db.query.formTemplates.findFirst({
      where: eq(formTemplates.id, id),
    })
    return template
  },

  // User Tracking
  async trackUserVisit(fingerprint: string, ip: string, userAgent: string) {
    const [tracking] = await db.insert(userTracking).values({
      fingerprint,
      ipAddress: ip,
      userAgent,
      firstVisit: new Date(),
      lastVisit: new Date(),
      visitCount: 1,
    }).onConflictDoUpdate({
      target: userTracking.fingerprint,
      set: {
        lastVisit: new Date(),
        visitCount: sql`${userTracking.visitCount} + 1`,
        updatedAt: new Date(),
      },
    }).returning()
    return tracking
  },

  async updateUserTracking(fingerprint: string, updates: any) {
    updates.updatedAt = new Date()
    const [updatedTracking] = await db.update(userTracking)
      .set(updates)
      .where(eq(userTracking.fingerprint, fingerprint))
      .returning()
    return updatedTracking
  },

  async getUserTracking(fingerprint: string) {
    const tracking = await db.query.userTracking.findFirst({
      where: eq(userTracking.fingerprint, fingerprint),
    })
    return tracking
  },

  // Firebase Auth Mapping
  // Migrate anonymous user to authenticated user
  async migrateAnonymousToAuthenticated(fingerprint: string, firebaseUid: string) {
    try {
      console.log('🔄 Starting migration from anonymous to authenticated user...')

      // Get anonymous user data
      const anonymousUser = await this.getAnonymousUser(fingerprint)
      if (!anonymousUser) {
        console.log('⚠️ No anonymous user found for migration')
        return null
      }

      // Create authenticated user with Firebase UID if it doesn't exist
      let targetUser = await this.getUser(firebaseUid)
      if (!targetUser) {
        const newUser = {
          id: firebaseUid,
          email: '', // Will be set by Firebase auth
          firstName: null,
          lastName: null,
        }
        const createdUser = await this.createUser(newUser as any)
        console.log('✅ Authenticated user created:', createdUser)
      } else {
        console.log('🔄 Authenticated user already exists, proceeding with migration')
      }

      // Migrate forms from anonymous to authenticated user
      const formsToMigrate = await db.query.forms.findMany({
        where: eq(forms.userId, fingerprint),
      })

      if (formsToMigrate.length > 0) {
        console.log(`🔄 Migrating ${formsToMigrate.length} forms to authenticated user...`)

        // 1. Move all forms to the authenticated user ID
        await db.update(forms)
          .set({
            userId: firebaseUid,
            updatedAt: new Date(),
          })
          .where(eq(forms.userId, fingerprint))

        console.log('✅ Forms successfully migrated to authenticated user')

        // 2. Enforce the Free Tier 5-Form limit on published forms
        // Check if the target user is on a free tier
        // Note: targetUser may not have subscriptionTier if they just signed up, default to true for limiting if missing
        const isPro = targetUser?.subscriptionTier === 'pro';

        if (!isPro) {
          // Get all published forms for the new authenticated user
          const allPublishedForms = await db.query.forms.findMany({
            where: and(
              eq(forms.userId, firebaseUid),
              eq(forms.status, 'published')
            ),
            orderBy: [desc(forms.updatedAt)],
          });

          if (allPublishedForms.length > 5) {
            console.log(`⚠️ User has ${allPublishedForms.length} published forms, exceeding the free limit of 5. Unpublishing the oldest ${allPublishedForms.length - 5}...`);

            // Keep the 5 most recently updated forms, unpublish the rest
            const formsToUnpublish = allPublishedForms.slice(5);
            const formIdsToUnpublish = formsToUnpublish.map(f => f.id);

            if (formIdsToUnpublish.length > 0) {
              await db.update(forms)
                .set({
                  status: 'draft',
                  isPublished: false,
                  updatedAt: new Date()
                })
                .where(inArray(forms.id, formIdsToUnpublish));

              console.log(`✅ Successfully unpublished ${formIdsToUnpublish.length} excess forms to enforce limits.`);
            }
          }
        }
      }

      // Migrate form submissions
      const submissionsToMigrate = await db.query.formSubmissions.findMany({
        where: eq(formSubmissions.userId, fingerprint),
      })

      if (submissionsToMigrate.length > 0) {
        console.log(`🔄 Migrating ${submissionsToMigrate.length} submissions to authenticated user...`)

        await db.update(formSubmissions)
          .set({
            userId: firebaseUid,
            updatedAt: new Date(),
          })
          .where(eq(formSubmissions.userId, fingerprint))

        console.log('✅ Submissions successfully migrated to authenticated user')
      }

      // Archive the anonymous user record (don't delete for audit purposes)
      await this.updateAnonymousUser(fingerprint, {
        // Add migration tracking fields if needed
      })

      console.log('✅ Anonymous user successfully migrated to authenticated user')
      return { id: firebaseUid }

    } catch (error) {
      console.error('❌ Error during migration:', error)
      throw error
    }
  },

  // Admin methods
  async getUsers() {
    try {
      const allUsers = await db.query.users.findMany({
        with: {
          profile: true,
        },
        orderBy: [desc(users.createdAt)],
      })
      return allUsers
    } catch (error) {
      console.warn('Users query failed, returning empty array:', error)
      return []
    }
  },

  async getForms() {
    try {
      const allForms = await db.query.forms.findMany({
        with: {
          user: true,
          fields: {
            orderBy: [formFields.order],
          },
        },
        orderBy: [desc(forms.createdAt)],
      })
      return allForms
    } catch (error) {
      console.warn('Forms query failed, returning empty array:', error)
      return []
    }
  },

  // Get form responses (submissions) for a specific form
  async getFormResponses(formId: string) {
    try {
      const responses = await db.query.formSubmissions.findMany({
        where: eq(formSubmissions.formId, formId),
        orderBy: [desc(formSubmissions.submittedAt)],
      })
      return responses
    } catch (error) {
      console.error('Error fetching form responses:', error)
      return []
    }
  },

  // Get all form submissions (for admin)
  async getAllFormSubmissions() {
    try {
      const allSubmissions = await db.query.formSubmissions.findMany({
        with: {
          form: true,
          user: true,
        },
        orderBy: [desc(formSubmissions.createdAt)],
      })
      return allSubmissions
    } catch (error) {
      // If there's a schema mismatch, return empty array for now
      console.warn('Form submissions query failed, returning empty array:', error)
      return []
    }
  },

  // Create form response (submission)
  async createResponse(submission: {
    formId: string
    userId?: string | null
    sessionId?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    referrer?: string | null
    status?: 'pending' | 'approved' | 'rejected' | 'spam'
    isSpam?: boolean
    spamScore?: number | null
    data: any
    metadata?: any
    submittedAt?: Date
  }) {
    try {
      console.log('Creating form response:', submission)
      const [newSubmission] = await db.insert(formSubmissions).values({
        formId: submission.formId,
        userId: submission.userId || null,
        sessionId: submission.sessionId || null,
        ipAddress: submission.ipAddress || null,
        userAgent: submission.userAgent || null,
        referrer: submission.referrer || null,
        status: submission.status || 'pending',
        isSpam: submission.isSpam || false,
        spamScore: submission.spamScore || null,
        data: submission.data,
        metadata: submission.metadata || {},
        submittedAt: submission.submittedAt || new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning()
      console.log('Form response created successfully:', newSubmission.id)
      return newSubmission
    } catch (error) {
      console.error('Error creating form response:', error)
      throw error
    }
  },

  async getPaymentIntents() {
    try {
      const allPayments = await db.query.paymentIntents.findMany({
        with: {
          user: true,
        },
        orderBy: [desc(paymentIntents.createdAt)],
      })
      return allPayments
    } catch (error) {
      // If there's a schema mismatch, return empty array for now
      console.warn('Payment intents query failed, returning empty array:', error)
      return []
    }
  },

  // FAQs
  async createFAQ(faq: {
    question: string
    answer: string
    category?: string
    order?: number
    createdBy?: string
  }) {
    const [newFAQ] = await db.insert(faqs).values({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'general',
      order: faq.order || 0,
      createdBy: faq.createdBy,
      updatedBy: faq.createdBy,
    }).returning()
    return newFAQ
  },

  async getFAQs() {
    const allFAQs = await db.select().from(faqs).orderBy(faqs.order, faqs.createdAt)
    return allFAQs
  },

  async getActiveFAQs() {
    const activeFAQs = await db.select().from(faqs)
      .where(eq(faqs.isActive, true))
      .orderBy(faqs.order, faqs.createdAt)
    return activeFAQs
  },

  async getFAQById(id: string) {
    const [faq] = await db.select().from(faqs).where(eq(faqs.id, id))
    return faq
  },

  async updateFAQ(id: string, updates: {
    question?: string
    answer?: string
    category?: string
    order?: number
    isActive?: boolean
    updatedBy?: string
  }) {
    const [updatedFAQ] = await db.update(faqs)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(faqs.id, id))
      .returning()
    return updatedFAQ
  },

  async deleteFAQ(id: string) {
    await db.delete(faqs).where(eq(faqs.id, id))
  },

  async getFAQsByCategory(category: string) {
    const categoryFAQs = await db.select().from(faqs)
      .where(and(
        eq(faqs.category, category),
        eq(faqs.isActive, true)
      ))
      .orderBy(faqs.order, faqs.createdAt)
    return categoryFAQs
  },

  // Support Tickets
  async createSupportTicket(ticket: {
    userId?: string
    userEmail: string
    userName?: string
    subject: string
    description: string
    category?: 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'general' | 'demo_request'
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    tags?: string[]
    metadata?: any
  }) {
    // Generate ticket number
    const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    const [newTicket] = await db.insert(supportTickets).values({
      ticketNumber,
      userId: ticket.userId,
      userEmail: ticket.userEmail,
      userName: ticket.userName,
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category || 'general',
      priority: ticket.priority || 'medium',
      tags: ticket.tags || [],
      metadata: ticket.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()

    return newTicket
  },

  async getSupportTickets(filters?: {
    status?: string
    priority?: string
    category?: string
    assignedTo?: string
    limit?: number
    offset?: number
  }) {
    try {
      const conditions = []
      if (filters?.status) conditions.push(eq(supportTickets.status, filters.status as any))
      if (filters?.priority) conditions.push(eq(supportTickets.priority, filters.priority as any))
      if (filters?.category) conditions.push(eq(supportTickets.category, filters.category as any))
      if (filters?.assignedTo) conditions.push(eq(supportTickets.assignedTo, filters.assignedTo))

      if (conditions.length > 0) {
        return await db
          .select()
          .from(supportTickets)
          .where(and(...conditions))
          .orderBy(desc(supportTickets.createdAt))
          .limit(filters?.limit || 100)
          .offset(filters?.offset || 0)
      } else {
        return await db
          .select()
          .from(supportTickets)
          .orderBy(desc(supportTickets.createdAt))
          .limit(filters?.limit || 100)
          .offset(filters?.offset || 0)
      }
    } catch (error) {
      console.warn('Support tickets query failed, returning empty array:', error)
      return []
    }
  },

  async getSupportTicketById(id: string) {
    const [ticket] = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, id))
    return ticket
  },

  async updateSupportTicket(id: string, updates: {
    status?: 'open' | 'in_progress' | 'resolved' | 'closed'
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    assignedTo?: string
    tags?: string[]
    metadata?: any
  }) {
    const updateData: any = {
      ...updates,
      updatedAt: new Date(),
    }

    if (updates.status === 'resolved') {
      updateData.resolvedAt = new Date()
    }
    if (updates.status === 'closed') {
      updateData.closedAt = new Date()
    }

    const [updatedTicket] = await db
      .update(supportTickets)
      .set(updateData)
      .where(eq(supportTickets.id, id))
      .returning()

    return updatedTicket
  },

  async addTicketMessage(message: {
    ticketId: string
    userId?: string
    userEmail?: string
    userName?: string
    message: string
    isInternal?: boolean
    attachments?: any[]
  }) {
    const [newMessage] = await db.insert(ticketMessages).values({
      ticketId: message.ticketId,
      userId: message.userId,
      userEmail: message.userEmail,
      userName: message.userName,
      message: message.message,
      isInternal: message.isInternal || false,
      attachments: message.attachments || [],
      createdAt: new Date(),
    }).returning()

    return newMessage
  },

  async getTicketMessages(ticketId: string) {
    return await db
      .select()
      .from(ticketMessages)
      .where(eq(ticketMessages.ticketId, ticketId))
      .orderBy(ticketMessages.createdAt)
  },

  // Notifications
  async createNotification(notification: {
    userId?: string
    type: 'ticket_created' | 'ticket_updated' | 'ticket_resolved' | 'system_alert' | 'user_registration' | 'form_submission'
    title: string
    message: string
    data?: any
  }) {
    const [newNotification] = await db.insert(notifications).values({
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data || {},
      createdAt: new Date(),
    }).returning()

    return newNotification
  },

  async getNotifications(userId?: string, filters?: {
    status?: 'unread' | 'read' | 'archived'
    type?: string
    limit?: number
  }) {
    try {
      const conditions = []

      if (userId) {
        conditions.push(eq(notifications.userId, userId))
      }

      if (filters?.status) {
        conditions.push(eq(notifications.status, filters.status as any))
      }
      if (filters?.type) {
        conditions.push(eq(notifications.type, filters.type as any))
      }

      if (conditions.length > 0) {
        return await db
          .select()
          .from(notifications)
          .where(and(...conditions))
          .orderBy(desc(notifications.createdAt))
          .limit(filters?.limit || 50)
      } else {
        return await db
          .select()
          .from(notifications)
          .orderBy(desc(notifications.createdAt))
          .limit(filters?.limit || 50)
      }
    } catch (error) {
      console.warn('Notifications query failed, returning empty array:', error)
      return []
    }
  },

  async markNotificationAsRead(id: string) {
    const [updatedNotification] = await db
      .update(notifications)
      .set({
        status: 'read',
        readAt: new Date(),
      })
      .where(eq(notifications.id, id))
      .returning()

    return updatedNotification
  },

  async getUnreadNotificationCount(userId?: string) {
    const conditions = [eq(notifications.status, 'unread')]

    if (userId) {
      conditions.push(eq(notifications.userId, userId))
    }

    const [result] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(...conditions))

    return result.count
  },

  // System Analytics
  async recordAnalytics(metric: {
    date: Date
    metric: string
    value: number
    metadata?: any
  }) {
    const [newMetric] = await db.insert(systemAnalytics).values({
      date: metric.date,
      metric: metric.metric,
      value: metric.value,
      metadata: metric.metadata || {},
      createdAt: new Date(),
    }).returning()

    return newMetric
  },

  async getAnalytics(filters?: {
    metric?: string
    startDate?: Date
    endDate?: Date
    limit?: number
  }) {
    const conditions = []
    if (filters?.metric) conditions.push(eq(systemAnalytics.metric, filters.metric))
    if (filters?.startDate) conditions.push(sql`${systemAnalytics.date} >= ${filters.startDate}`)
    if (filters?.endDate) conditions.push(sql`${systemAnalytics.date} <= ${filters.endDate}`)

    if (conditions.length > 0) {
      return await db
        .select()
        .from(systemAnalytics)
        .where(and(...conditions))
        .orderBy(desc(systemAnalytics.date))
        .limit(filters?.limit || 100)
    } else {
      return await db
        .select()
        .from(systemAnalytics)
        .orderBy(desc(systemAnalytics.date))
        .limit(filters?.limit || 100)
    }
  },

  // Form Drafts Service Methods
  async createDraft(draft: {
    formId: string
    userId?: string | null
    sessionId?: string | null
    fingerprint?: string | null
    draftData: Record<string, any>
    progressData?: Record<string, any>
  }) {
    try {
      const [newDraft] = await db.insert(formDrafts).values({
        formId: draft.formId,
        userId: draft.userId || null,
        sessionId: draft.sessionId || null,
        fingerprint: draft.fingerprint || null,
        draftData: draft.draftData,
        progressData: draft.progressData || {},
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        createdAt: new Date(),
        updatedAt: new Date(),
        lastAccessedAt: new Date(),
      }).returning()

      return newDraft
    } catch (error) {
      console.error('Error creating draft:', error)
      throw error
    }
  },

  async updateDraft(draftId: string, updates: {
    draftData?: Record<string, any>
    progressData?: Record<string, any>
  }) {
    try {
      const [updatedDraft] = await db.update(formDrafts)
        .set({
          ...updates,
          updatedAt: new Date(),
          lastAccessedAt: new Date(),
        })
        .where(eq(formDrafts.id, draftId))
        .returning()

      return updatedDraft
    } catch (error) {
      console.error('Error updating draft:', error)
      throw error
    }
  },

  async getDraft(draftId: string) {
    try {
      const draft = await db.query.formDrafts.findFirst({
        where: eq(formDrafts.id, draftId),
        with: {
          form: true,
          user: true,
        }
      })

      if (draft) {
        // Update last accessed time
        await db.update(formDrafts)
          .set({ lastAccessedAt: new Date() })
          .where(eq(formDrafts.id, draftId))
      }

      return draft
    } catch (error) {
      console.error('Error fetching draft:', error)
      throw error
    }
  },

  async getDraftByFormAndUser(formId: string, userId?: string, sessionId?: string, fingerprint?: string) {
    try {
      // Skip if formId is not a valid UUID (like 'default-form')
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(formId)
      if (!isUuid) {
        console.log('⚠️ Skipping draft lookup for non-UUID formId:', formId)
        return null
      }

      let whereCondition

      if (userId) {
        whereCondition = and(eq(formDrafts.formId, formId), eq(formDrafts.userId, userId))
      } else if (sessionId) {
        whereCondition = and(eq(formDrafts.formId, formId), eq(formDrafts.sessionId, sessionId))
      } else if (fingerprint) {
        whereCondition = and(eq(formDrafts.formId, formId), eq(formDrafts.fingerprint, fingerprint))
      } else {
        return null
      }

      const draft = await db.query.formDrafts.findFirst({
        where: whereCondition,
        with: {
          form: true,
          user: true,
        }
      })

      if (draft) {
        // Update last accessed time
        await db.update(formDrafts)
          .set({ lastAccessedAt: new Date() })
          .where(eq(formDrafts.id, draft.id))
      }

      return draft
    } catch (error) {
      console.error('Error fetching draft by form and user:', error)
      throw error
    }
  },

  async deleteDraft(draftId: string) {
    try {
      await db.delete(formDrafts).where(eq(formDrafts.id, draftId))
      return true
    } catch (error) {
      console.error('Error deleting draft:', error)
      throw error
    }
  },

  async getUserDrafts(userId: string) {
    try {
      const drafts = await db.query.formDrafts.findMany({
        where: eq(formDrafts.userId, userId),
        with: {
          form: true,
        },
        orderBy: [desc(formDrafts.updatedAt)]
      })

      return drafts
    } catch (error) {
      console.error('Error fetching user drafts:', error)
      throw error
    }
  },

  async getFormDrafts(formId: string) {
    try {
      const drafts = await db.query.formDrafts.findMany({
        where: eq(formDrafts.formId, formId),
        with: {
          user: true,
        },
        orderBy: [desc(formDrafts.updatedAt)]
      })

      return drafts
    } catch (error) {
      console.error('Error fetching form drafts:', error)
      throw error
    }
  },

  async cleanupExpiredDrafts() {
    try {
      const result = await db.delete(formDrafts)
        .where(sql`${formDrafts.expiresAt} < NOW()`)
        .returning({ id: formDrafts.id })

      // Log cleanup activity
      await db.insert(systemAnalytics).values({
        date: new Date(),
        metric: 'drafts_cleaned_up',
        value: result.length,
        metadata: { cleanup_type: 'expired_drafts' },
        createdAt: new Date(),
      })

      return result.length
    } catch (error) {
      console.error('Error cleaning up expired drafts:', error)
      throw error
    }
  },
}
