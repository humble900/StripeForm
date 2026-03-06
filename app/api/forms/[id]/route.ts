import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'
import { withRateLimit, apiRateLimit } from '@/lib/rate-limit'
import { withErrorHandling, NotFoundError } from '@/lib/error-handler'
import { formCache } from '@/lib/cache'

// GET /api/forms/[id] - Get a specific form by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      const { id } = await params

      if (!id) {
        throw new NotFoundError('Form ID or slug is required')
      }

      // Check cache first
      const cacheKey = `form:${id}`
      const cached = formCache.get(cacheKey)

      if (cached) {
        return NextResponse.json(cached)
      }

      // Try to get form by ID first, then by slug if not found
      let form = await dbService.getForm(id)

      // If not found by ID, try by slug
      if (!form) {
        form = await dbService.getFormBySlug(id)
      }

      if (!form) {
        throw new NotFoundError('Form not found')
      }

      const response = {
        success: true,
        data: form
      }

      // Cache for 2 minutes (forms don't change that often)
      formCache.set(cacheKey, response, 2 * 60 * 1000)

      return NextResponse.json(response)
    })
  )
}

// PUT /api/forms/[id] - Update a form
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      const { id } = await params
      const body = await request.json()

      if (!id) {
        throw new NotFoundError('Form ID is required')
      }

      // Check if form exists
      const existingForm = await dbService.getForm(id)
      if (!existingForm) {
        throw new NotFoundError('Form not found')
      }

      // Extract fields from body if provided
      const { fields, ...formUpdates } = body

      // Parse string dates into actual Date objects for Drizzle ORM
      const dateFields = ['publishedAt', 'updatedAt', 'expiresAt', 'createdAt']
      for (const field of dateFields) {
        if (typeof formUpdates[field] === 'string') {
          const parsed = new Date(formUpdates[field])
          if (!isNaN(parsed.getTime())) {
            formUpdates[field] = parsed
          } else {
            delete formUpdates[field]
          }
        }
      }

      // Enforce publish limits and set publishedAt when form is being published
      if (formUpdates.status === 'published' && !existingForm.publishedAt) {
        // Determine user and role/subscription
        const ownerId = existingForm.userId
        let isAdmin = false
        let isPro = false
        try {
          const owner = await dbService.getUser(ownerId)
          const role = (owner as any)?.role || 'user'
          const tier = (owner as any)?.subscriptionTier || 'free'
          const subStatus = (owner as any)?.subscriptionStatus || 'inactive'
          isAdmin = role === 'admin' || role === 'super_admin'
          isPro = tier === 'pro' && (subStatus === 'active')
        } catch { }

        if (!isAdmin && !isPro) {
          // For free/authenticated users: limit to 5 published forms
          const userForms = await dbService.getForms()
          const userPublished = (userForms || []).filter((f: any) => f.userId === ownerId && f.status === 'published').length
          if (userPublished >= 5) {
            return NextResponse.json({
              success: false,
              message: 'Publish limit reached for your plan. Please upgrade to Pro to publish more forms.'
            }, { status: 403 })
          }
        }

        formUpdates.publishedAt = new Date()
      }

      console.log('📝 Updating form with data:', formUpdates)

      // Update the form properties
      const updatedForm = await dbService.updateForm(id, formUpdates)

      console.log('✅ Form updated successfully:', updatedForm)

      // If fields are provided, update them
      if (fields && Array.isArray(fields)) {
        // Get existing fields
        const existingFields = await dbService.getFormFields(id)
        const existingFieldIds = existingFields.map(f => f.id)

        // Delete fields that are no longer in the new fields array
        const newFieldIds = fields.filter(f => f.id && f.id !== '').map(f => f.id)
        const fieldsToDelete = existingFieldIds.filter(id => !newFieldIds.includes(id))

        for (const fieldId of fieldsToDelete) {
          await dbService.deleteFormField(fieldId)
        }

        // Update or create fields
        for (let i = 0; i < fields.length; i++) {
          const field = fields[i]
          const fieldData = {
            formId: id,
            type: field.type,
            label: field.label,
            placeholder: field.placeholder || null,
            required: field.required || false,
            validation: field.validation || null,
            options: field.options || null,
            order: i,
            settings: field.settings || {},
            conditionalLogic: field.conditional_logic || null
          }

          if (field.id && existingFieldIds.includes(field.id)) {
            // Update existing field
            await dbService.updateFormField(field.id, fieldData)
          } else {
            // Create new field
            await dbService.createFormField(fieldData)
          }
        }
      }

      // Get the updated form with fields
      const formWithFields = await dbService.getForm(id)

      if (!formWithFields) {
        throw new Error('Failed to retrieve updated form')
      }

      // Generate published URL if form is published
      let publishedUrl = formWithFields.publishedUrl
      if (formWithFields.status === 'published' && !publishedUrl) {
        // Use proper domain detection
        const host = request.headers.get('host') || 'localhost:3000'
        const protocol = request.headers.get('x-forwarded-proto') || 'http'
        const baseUrl = host.includes('localhost') ? `${protocol}://${host}` : 'https://stripeform.com'
        publishedUrl = `${baseUrl}/forms/${formWithFields.slug || formWithFields.id}`

        // Update the form with the generated URL
        await dbService.updateForm(id, { publishedUrl })
        formWithFields.publishedUrl = publishedUrl
      }

      // Invalidate cache
      formCache.delete(`form:${id}`)
      if (formWithFields && formWithFields.slug) {
        formCache.delete(`form:${formWithFields.slug}`)
      }

      // Invalidate user forms cache for this user
      const userFormsCacheKeys = [
        `user-forms:${formWithFields.userId}:all:50:0`,
        `user-forms:${formWithFields.userId}:published:50:0`,
        `user-forms:${formWithFields.userId}:draft:50:0`
      ]

      userFormsCacheKeys.forEach(key => {
        formCache.delete(key)
      })

      return NextResponse.json({
        success: true,
        data: {
          ...formWithFields,
          publishedUrl: publishedUrl || formWithFields.publishedUrl
        },
        message: 'Form updated successfully'
      })
    })
  )
}

// DELETE /api/forms/[id] - Delete a form
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      const { id } = await params

      if (!id) {
        throw new NotFoundError('Form ID is required')
      }

      // Check if form exists
      const existingForm = await dbService.getForm(id)
      if (!existingForm) {
        throw new NotFoundError('Form not found')
      }

      // Delete the form
      await dbService.deleteForm(id)

      // Invalidate cache
      formCache.delete(`form:${id}`)
      if (existingForm && existingForm.slug) {
        formCache.delete(`form:${existingForm.slug}`)
      }

      return NextResponse.json({
        success: true,
        message: 'Form deleted successfully'
      })
    })
  )
}
