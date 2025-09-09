import { db } from '@/lib/db'
import { forms, formFields, formSubmissions } from '@/lib/db/schema'
import { eq, and, desc, asc, count, sql } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export interface CreateFormData {
  userId: string
  title: string
  description?: string
  slug?: string
  isPublic?: boolean
  allowAnonymous?: boolean
  requireCaptcha?: boolean
  maxSubmissions?: number
  submissionLimit?: number
  settings?: any
  theme?: any
  brandKit?: any
  expiresAt?: Date
}

export interface UpdateFormData {
  title?: string
  description?: string
  slug?: string
  status?: 'draft' | 'published' | 'archived' | 'deleted'
  isPublic?: boolean
  allowAnonymous?: boolean
  requireCaptcha?: boolean
  maxSubmissions?: number
  submissionLimit?: number
  settings?: any
  theme?: any
  brandKit?: any
  expiresAt?: Date
  publishedAt?: Date
}

export interface CreateFieldData {
  formId: string
  type: string
  label: string
  placeholder?: string
  required?: boolean
  validation?: any
  options?: any[]
  order: number
  settings?: any
  conditionalLogic?: any
}

export interface UpdateFieldData {
  type?: string
  label?: string
  placeholder?: string
  required?: boolean
  validation?: any
  options?: any[]
  order?: number
  settings?: any
  conditionalLogic?: any
}

export interface FormWithFields {
  id: string
  userId: string
  title: string
  description?: string | null
  slug: string
  status: string
  isPublic: boolean | null
  allowAnonymous: boolean | null
  requireCaptcha: boolean | null
  maxSubmissions?: number | null
  submissionLimit?: number | null
  submissionCount: number | null
  settings: any
  theme: any
  brandKit: any
  publishedAt?: Date | null
  expiresAt?: Date | null
  createdAt: Date
  updatedAt: Date
  fields: any[]
}

export interface FormSubmissionData {
  formId: string
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  referrer?: string
  data: any
  metadata?: any
}

export class FormService {
  /**
   * Create a new form
   */
  async createForm(data: CreateFormData): Promise<any> {
    // Generate slug if not provided
    const slug = data.slug || this.generateSlug(data.title)

    // Check if slug is unique
    const existingForm = await db.query.forms.findFirst({
      where: eq(forms.slug, slug)
    })

    if (existingForm) {
      throw new Error('Form with this slug already exists')
    }

    // Create form
    const [form] = await db.insert(forms).values({
      ...data,
      slug,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning()

    return form
  }

  /**
   * Get form by ID with fields
   */
  async getFormById(formId: string): Promise<FormWithFields | null> {
    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId)
    })

    if (!form) {
      return null
    }

    const fields = await db.query.formFields.findMany({
      where: eq(formFields.formId, formId),
      orderBy: (formFields, { asc }) => [asc(formFields.order)]
    })

    return {
      ...form,
      fields
    }
  }

  /**
   * Get form by slug with fields
   */
  async getFormBySlug(slug: string): Promise<FormWithFields | null> {
    const form = await db.query.forms.findFirst({
      where: eq(forms.slug, slug)
    })

    if (!form) {
      return null
    }

    const fields = await db.query.formFields.findMany({
      where: eq(formFields.formId, form.id),
      orderBy: (formFields, { asc }) => [asc(formFields.order)]
    })

    return {
      ...form,
      fields
    }
  }

  /**
   * Get public form by slug
   */
  async getPublicFormBySlug(slug: string): Promise<FormWithFields | null> {
    const form = await db.query.forms.findFirst({
      where: and(
        eq(forms.slug, slug),
        eq(forms.status, 'published'),
        eq(forms.isPublic, true)
      )
    })

    if (!form) {
      return null
    }

    // Check if form has expired
    if (form.expiresAt && new Date() > form.expiresAt) {
      return null
    }

    // Check submission limit
    if (form.submissionLimit && form.submissionCount && form.submissionCount >= form.submissionLimit) {
      return null
    }

    const fields = await db.query.formFields.findMany({
      where: eq(formFields.formId, form.id),
      orderBy: (formFields, { asc }) => [asc(formFields.order)]
    })

    return {
      ...form,
      fields
    }
  }

  /**
   * Update form
   */
  async updateForm(formId: string, data: UpdateFormData): Promise<any> {
    // Check if slug is unique (if being updated)
    if (data.slug) {
      const existingForm = await db.query.forms.findFirst({
        where: and(
          eq(forms.slug, data.slug),
          sql`${forms.id} != ${formId}`
        )
      })

      if (existingForm) {
        throw new Error('Form with this slug already exists')
      }
    }

    // Update form
    const [updatedForm] = await db.update(forms)
      .set({
        ...data,
        updatedAt: new Date(),
        ...(data.status === 'published' && !data.publishedAt ? { publishedAt: new Date() } : {})
      })
      .where(eq(forms.id, formId))
      .returning()

    return updatedForm
  }

  /**
   * Delete form
   */
  async deleteForm(formId: string): Promise<void> {
    await db.delete(forms).where(eq(forms.id, formId))
  }

  /**
   * List forms for a user
   */
  async listUserForms(userId: string, page: number = 1, limit: number = 20, filters?: any): Promise<{
    forms: any[]
    total: number
    page: number
    totalPages: number
  }> {
    const offset = (page - 1) * limit

    // Build where clause
    let whereClause = eq(forms.userId, userId)
    if (filters?.status) {
      whereClause = and(whereClause, eq(forms.status, filters.status))!
    }

    // Get forms
    const formsList = await db.query.forms.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (forms, { desc }) => [desc(forms.updatedAt)]
    })

    // Get total count
    const totalResult = await db.select({ count: forms.id }).from(forms).where(whereClause)
    const total = totalResult.length

    return {
      forms: formsList,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Add field to form
   */
  async addField(data: CreateFieldData): Promise<any> {
    const [field] = await db.insert(formFields).values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning()

    return field
  }

  /**
   * Update field
   */
  async updateField(fieldId: string, data: UpdateFieldData): Promise<any> {
    const [updatedField] = await db.update(formFields)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(formFields.id, fieldId))
      .returning()

    return updatedField
  }

  /**
   * Delete field
   */
  async deleteField(fieldId: string): Promise<void> {
    await db.delete(formFields).where(eq(formFields.id, fieldId))
  }

  /**
   * Reorder fields
   */
  async reorderFields(formId: string, fieldOrders: { id: string; order: number }[]): Promise<void> {
    for (const fieldOrder of fieldOrders) {
      await db.update(formFields)
        .set({
          order: fieldOrder.order,
          updatedAt: new Date()
        })
        .where(eq(formFields.id, fieldOrder.id))
    }
  }

  /**
   * Submit form
   */
  async submitForm(data: FormSubmissionData): Promise<any> {
    // Get form to validate submission
    const form = await this.getFormById(data.formId)
    if (!form) {
      throw new Error('Form not found')
    }

    if (form.status !== 'published') {
      throw new Error('Form is not published')
    }

    if (form.expiresAt && new Date() > form.expiresAt) {
      throw new Error('Form has expired')
    }

    if (form.submissionLimit && form.submissionCount && form.submissionCount >= form.submissionLimit) {
      throw new Error('Form submission limit reached')
    }

    // Validate required fields
    const requiredFields = form.fields.filter(field => field.required)
    for (const field of requiredFields) {
      if (!data.data[field.id] && data.data[field.id] !== 0) {
        throw new Error(`Field '${field.label}' is required`)
      }
    }

    // Create submission
    const [submission] = await db.insert(formSubmissions).values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning()

    // Update submission count
    await db.update(forms)
      .set({
        submissionCount: sql`${forms.submissionCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(forms.id, data.formId))

    // Track analytics
    await this.trackEvent(data.formId, 'submission', {
      submissionId: submission.id,
      sessionId: data.sessionId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      referrer: data.referrer
    })

    return submission
  }

  /**
   * Get form submissions
   */
  async getFormSubmissions(formId: string, page: number = 1, limit: number = 20, filters?: any): Promise<{
    submissions: any[]
    total: number
    page: number
    totalPages: number
  }> {
    const offset = (page - 1) * limit

    // Build where clause
    let whereClause = eq(formSubmissions.formId, formId)
    if (filters?.status) {
      whereClause = and(whereClause, eq(formSubmissions.status, filters.status))!
    }

    // Get submissions
    const submissionsList = await db.query.formSubmissions.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (formSubmissions, { desc }) => [desc(formSubmissions.submittedAt)]
    })

    // Get total count
    const totalResult = await db.select({ count: formSubmissions.id }).from(formSubmissions).where(whereClause)
    const total = totalResult.length

    return {
      submissions: submissionsList,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Update submission status
   */
  async updateSubmissionStatus(submissionId: string, status: string): Promise<any> {
    const [updatedSubmission] = await db.update(formSubmissions)
      .set({
        status: status as any,
        processedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(formSubmissions.id, submissionId))
      .returning()

    return updatedSubmission
  }

  /**
   * Delete submission
   */
  async deleteSubmission(submissionId: string): Promise<void> {
    await db.delete(formSubmissions).where(eq(formSubmissions.id, submissionId))
  }

  /**
   * Track analytics event
   */
  async trackEvent(formId: string, eventType: string, eventData: any = {}): Promise<void> {
    // Analytics not implemented yet - skip for now
    console.log('Analytics event tracked:', { formId, eventType, eventData })
  }

  /**
   * Get form analytics
   */
  async getFormAnalytics(formId: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<any> {
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get analytics data
    // Get form submissions for analytics
    const submissions = await db.query.formSubmissions.findMany({
      where: and(
        eq(formSubmissions.formId, formId),
        sql`${formSubmissions.submittedAt} >= ${startDate}`
      ),
      orderBy: [asc(formSubmissions.submittedAt)]
    })

    // Process analytics data
    const views = 0 // Not implemented yet
    const submissionCount = submissions.length
    const conversionRate = 0 // Not implemented yet

    return {
      period,
      startDate,
      endDate: now,
      views,
      submissions: submissionCount,
      conversionRate: Math.round(conversionRate * 100) / 100,
      events: [] // Not implemented yet
    }
  }

  /**
   * Generate unique slug from title
   */
  private generateSlug(title: string): string {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    return `${baseSlug}-${randomUUID().slice(0, 8)}`
  }
}

// Export singleton instance
export const formService = new FormService()
