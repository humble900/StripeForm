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
import { eq, and, desc, count, sql } from 'drizzle-orm'
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
    role?: 'user' | 'admin' | 'super_admin'
    status?: 'active' | 'inactive' | 'suspended'
    emailVerified?: boolean
  }) {
    const [newUser] = await db.insert(users).values({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      countryCode: user.countryCode,
      role: user.role || 'user',
      status: user.status || 'active',
      emailVerified: user.emailVerified ?? true, // Default to verified for admin-created users
      createdAt: new Date(),
      updatedAt: new Date(),
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
    role?: 'user' | 'admin' | 'super_admin'
    status?: 'active' | 'inactive' | 'suspended'
  }) {
    // Separate user and profile updates
    const userData: any = {}
    const profileData: any = {}

    if (updates.email) userData.email = updates.email
    if (updates.firstName) userData.firstName = updates.firstName
    if (updates.lastName) userData.lastName = updates.lastName
    if (updates.phoneNumber) userData.phoneNumber = updates.phoneNumber
    if (updates.countryCode) userData.countryCode = updates.countryCode
    if (updates.role) userData.role = updates.role
    if (updates.status) userData.status = updates.status

    if (updates.bio) profileData.bio = updates.bio
    if (updates.company) profileData.company = updates.company
    if (updates.website) profileData.website = updates.website
    if (updates.phone) profileData.phone = updates.phone
    if (updates.timezone) profileData.timezone = updates.timezone
    if (updates.language) profileData.language = updates.language

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

  // Subscription management
  async updateUserSubscription(userId: string, subscriptionData: {
    subscriptionTier?: 'free' | 'pro' | 'enterprise'
    subscriptionStatus?: 'active' | 'inactive' | 'canceled' | 'past_due' | 'unpaid'
    subscriptionExpiresAt?: Date | null
    stripeCustomerId?: string | null
  }) {
    try {
      const [updatedUser] = await db.update(users)
        .set({
          ...subscriptionData,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning()

      return updatedUser
    } catch (error) {
      console.error('Error updating user subscription:', error)
      throw error
    }
  },

  async getUserByEmail(email: string) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
        with: {
          profile: true,
        },
      })
      return user
    } catch (error) {
      console.error('Error fetching user by email:', error)
      return null
    }
  },

  async getUserByStripeCustomerId(stripeCustomerId: string) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.stripeCustomerId, stripeCustomerId),
        with: {
          profile: true,
        },
      })
      return user
    } catch (error) {
      console.error('Error fetching user by Stripe customer ID:', error)
      return null
    }
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

    const [newForm] = await db.insert(forms).values({
      ...form,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()

    return newForm
  },

  async getForm(formId: string) {
    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
      with: {
        fields: {
          orderBy: [formFields.order],
        },
      },
    })
    return form
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
    updates.updatedAt = new Date()
    const [updatedForm] = await db.update(forms)
      .set(updates)
      .where(eq(forms.id, formId))
      .returning()
    console.log('✅ Database form updated:', updatedForm)
    return updatedForm
  },

  /**
   * Determine if a user can publish another form based on subscription and current published count.
   * - Pro users with active, non-expired subscriptions have no publish limit.
   * - All others (including anonymous placeholders) have a limit of 5 published forms.
   */
  async canUserCreateForm(userId: string): Promise<{ canCreate: boolean; currentCount: number; limit: number }> {
    // Default free limit
    const FREE_LIMIT = 5

    // Try to find a real user by ID
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) })

    // If user exists and is Pro with active subscription and not expired, allow unlimited
    if (user && (user as any).subscriptionTier === 'pro') {
      const status = (user as any).subscriptionStatus
      const expiresAt = (user as any).subscriptionExpiresAt as Date | null
      const isActive = status === 'active' && (!expiresAt || new Date(expiresAt) > new Date())
      if (isActive) {
        return { canCreate: true, currentCount: 0, limit: Number.POSITIVE_INFINITY as unknown as number }
      }
    }

    // Count how many published forms the owner already has
    const publishedCountRows = await db
      .select({ c: count() })
      .from(forms)
      .where(and(eq(forms.userId, userId), eq(forms.status, 'published')))

    const currentCount = (publishedCountRows?.[0]?.c as number) || 0
    const canCreate = currentCount < FREE_LIMIT

    return { canCreate, currentCount, limit: FREE_LIMIT }
  },

  /**
   * Migrate all data associated with an anonymous fingerprint to an authenticated user ID.
   * Currently migrates: forms, drafts, submissions, and tracking. Anonymous record is preserved but updated.
   */
  async migrateAnonymousToAuthenticated(fingerprint: string, userId: string) {
    // Move forms ownership
    const migratedForms = await db.update(forms)
      .set({ userId, updatedAt: new Date() })
      .where(eq(forms.userId, fingerprint))
      .returning()

    // Move drafts ownership
    await db.update(formDrafts)
      .set({ userId, updatedAt: new Date() })
      .where(eq(formDrafts.userId, fingerprint))

    // Move submissions userId when present
    await db.update(formSubmissions)
      .set({ userId, updatedAt: new Date() })
      .where(eq(formSubmissions.userId as any, fingerprint as any))

    // Update anonymousUsers row to reflect lastSeen and note migration in sessionData
    const anon = await db.query.anonymousUsers.findFirst({ where: eq(anonymousUsers.fingerprint, fingerprint) })
    if (anon) {
      const sessionData = { ...(anon as any).sessionData, migrated_to_user_id: userId, migrated_at: new Date().toISOString() }
      await db.update(anonymousUsers)
        .set({ sessionData, updatedAt: new Date() })
        .where(eq(anonymousUsers.fingerprint, fingerprint))
    }

    // Invalidate cache for both old and new user IDs to ensure fresh data
    try {
      const { formCache } = await import('@/lib/cache')
      
      // Clear cache for the old fingerprint (anonymous user)
      const oldCacheKeys = [
        `user-forms:${fingerprint}:all:50:0`,
        `user-forms:${fingerprint}:published:50:0`,
        `user-forms:${fingerprint}:draft:50:0`
      ]
      oldCacheKeys.forEach(key => formCache.delete(key))
      
      // Clear cache for the new user ID
      const newCacheKeys = [
        `user-forms:${userId}:all:50:0`,
        `user-forms:${userId}:published:50:0`,
        `user-forms:${userId}:draft:50:0`
      ]
      newCacheKeys.forEach(key => formCache.delete(key))
      
      // Clear individual form caches for migrated forms
      migratedForms.forEach(form => {
        formCache.delete(`form:${form.id}`)
      })
      
      console.log('✅ Cache invalidated after migration:', { fingerprint, userId, migratedFormsCount: migratedForms.length })
    } catch (cacheError) {
      console.warn('⚠️ Cache invalidation failed during migration:', cacheError)
    }

    return { success: true, migratedFormsCount: migratedForms.length }
  },

  async deleteForm(formId: string) {
    await db.delete(forms).where(eq(forms.id, formId))
  },

  async getUserForms(userId: string) {
    const userForms = await db.query.forms.findMany({
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
    })
    
    // Manually limit submissions to avoid potential issues with relation limits
    return userForms.map(form => ({
      ...form,
      submissions: form.submissions ? form.submissions.slice(0, 10) : []
    }))
  },

  async getUserFormsSummary(userId: string) {
    // Return only essential fields for dashboard performance
    const rows = await db.select({
      id: forms.id,
      userId: forms.userId,
      title: forms.title,
      slug: forms.slug,
      status: forms.status,
      isPublished: forms.isPublished,
      publishedUrl: forms.publishedUrl,
      publishedAt: forms.publishedAt,
      createdAt: forms.createdAt,
      updatedAt: forms.updatedAt,
      submissionCount: forms.submissionCount,
      viewCount: forms.viewCount,
    }).from(forms).where(eq(forms.userId, userId)).orderBy(desc(forms.updatedAt))

    // Ensure dates are serialized and values are plain JSON
    return rows.map((r) => ({
      ...r,
      createdAt: r.createdAt ? new Date(r.createdAt as any) : null,
      updatedAt: r.updatedAt ? new Date(r.updatedAt as any) : null,
      publishedAt: r.publishedAt ? new Date(r.publishedAt as any) : null,
    }))
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
    const [newAnonymousUser] = await db.insert(anonymousUsers).values({
      ...anonymousData,
      lastSeen: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()
    return newAnonymousUser
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

  async canAnonymousUserCreateForm(fingerprint: string): Promise<{ canCreate: boolean; currentCount: number; limit: number }> {
    // Ensure anonymous user exists
    const anonymousUser = await this.getAnonymousUser(fingerprint)
    if (!anonymousUser) {
      await this.createAnonymousUser({ fingerprint })
    }
    
    // Count published forms by querying the forms table (same as authenticated users)
    const publishedCountRows = await db
      .select({ c: count() })
      .from(forms)
      .where(and(eq(forms.userId, fingerprint), eq(forms.status, 'published')))

    const currentCount = (publishedCountRows?.[0]?.c as number) || 0
    const limit = 5 // Anonymous users limited to 5 forms
    
    return {
      canCreate: currentCount < limit,
      currentCount,
      limit
    }
  },

  

  async getAnonymousUserFormCount(fingerprint: string): Promise<{ currentCount: number; limit: number; remaining: number }> {
    // Ensure anonymous user exists
    const anonymousUser = await this.getAnonymousUser(fingerprint)
    if (!anonymousUser) {
      await this.createAnonymousUser({ fingerprint })
    }
    
    // Count published forms by querying the forms table (same as authenticated users)
    const publishedCountRows = await db
      .select({ c: count() })
      .from(forms)
      .where(and(eq(forms.userId, fingerprint), eq(forms.status, 'published')))

    const currentCount = (publishedCountRows?.[0]?.c as number) || 0
    const limit = 5
    const remaining = Math.max(0, limit - currentCount)
    
    return { currentCount, limit, remaining }
  },

  // incrementAnonymousUserFormCount removed - form counting is now handled automatically by querying the forms table

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

  async updatePaymentIntent(id: string, updates: any) {
    updates.updatedAt = new Date()
    const [updatedPaymentIntent] = await db.update(paymentIntents)
      .set(updates)
      .where(eq(paymentIntents.id, id))
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
  async createFirebaseMapping(firebaseUid: string, supabaseUserId: string) {
    const [mapping] = await db.insert(firebaseAuthMapping).values({
      firebaseUid,
      supabaseUuid: supabaseUserId,
      createdAt: new Date(),
    }).returning()
    return mapping
  },

  async getSupabaseUserIdFromFirebase(firebaseUid: string) {
    const mapping = await db.query.firebaseAuthMapping.findFirst({
      where: eq(firebaseAuthMapping.firebaseUid, firebaseUid),
    })
    return mapping?.supabaseUuid || null
  },

  

  // Admin methods
  async getUsers(options: {
    page?: number
    limit?: number
    role?: 'user' | 'admin' | 'super_admin'
  } = {}) {
    try {
      const { page = 1, limit = 50, role } = options
      const offset = (page - 1) * limit

      let query = db.query.users.findMany({
        with: {
          profile: true,
        },
        orderBy: [desc(users.createdAt)],
        limit,
        offset
      })

      // Apply role filter if specified
      if (role) {
        query = db.query.users.findMany({
          with: {
            profile: true,
          },
          where: eq(users.role, role),
          orderBy: [desc(users.createdAt)],
          limit,
          offset
        })
      }

      const allUsers = await query
      
      // Get total count for pagination
      const totalCount = await db.select({ count: count() }).from(users)
      
      return {
        users: allUsers,
        pagination: {
          page,
          limit,
          total: totalCount[0]?.count || 0,
          totalPages: Math.ceil((totalCount[0]?.count || 0) / limit)
        }
      }
    } catch (error) {
      console.warn('Users query failed, returning empty array:', error)
      return {
        users: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0
        }
      }
    }
  },

  // Get all users for admin statistics (no pagination)
  async getAllUsers() {
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

  async getForms(options?: {
    page?: number
    limit?: number
    status?: 'draft' | 'published' | 'archived'
    userId?: string
  }) {
    try {
      const page = options?.page || 1
      const limit = options?.limit || 50
      const offset = (page - 1) * limit

      // Build where conditions
      const whereConditions = []
      if (options?.status) {
        whereConditions.push(eq(forms.status, options.status))
      }
      if (options?.userId) {
        whereConditions.push(eq(forms.userId, options.userId))
      }

      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined

      // Get forms with pagination
      const formsData = await db.query.forms.findMany({
        where: whereClause,
        with: {
          user: true,
          fields: {
            orderBy: [formFields.order],
          },
        },
        orderBy: [desc(forms.createdAt)],
        limit,
        offset
      })

      // Get total count for pagination
      const totalCount = await db.select({ count: count() })
        .from(forms)
        .where(whereClause)

      const totalPages = Math.ceil((totalCount[0]?.count || 0) / limit)

      return {
        forms: formsData,
        pagination: {
          page,
          limit,
          totalCount: totalCount[0]?.count || 0,
          totalPages
        }
      }
    } catch (error) {
      console.warn('Forms query failed, returning empty array:', error)
      return {
        forms: [],
        pagination: {
          page: 1,
          limit: 50,
          totalCount: 0,
          totalPages: 0
        }
      }
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
    const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    
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

