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

      const isValidUuid = (uuid: string) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        return uuidRegex.test(uuid)
      }

      // Check cache first
      const cacheKey = `form:${id}`
      const cached = formCache.get(cacheKey)
      
      if (cached) {
        return NextResponse.json(cached)
      }

      let form = null
      if (isValidUuid(id)) {
        form = await dbService.getForm(id)
      } else {
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
      const { fields, ...rawUpdates } = body

      // Whitelist allowed columns to prevent invalid keys causing Drizzle errors
      const allowedKeys = new Set([
        'title',
        'description',
        'slug',
        'status',
        'isPublic',
        'allowAnonymous',
        'requireCaptcha',
        'maxSubmissions',
        'submissionLimit',
        'submissionCount',
        'viewCount',
        'settings',
        'theme',
        'brandKit',
        'isPublished',
        'publishedUrl',
        'publishedAt',
        'expiresAt',
        'metadata',
        'updatedAt',
      ])

      const formUpdates: Record<string, any> = {}
      Object.keys(rawUpdates || {}).forEach((key) => {
        if (allowedKeys.has(key)) {
          formUpdates[key] = rawUpdates[key]
        }
      })
      
      // Handle publishing
      if (formUpdates.status === 'published') {
        // Enforce publish limit based on the owning user of the form
        try {
          const limitInfo = await dbService.canUserCreateForm(existingForm.userId)
          if (!limitInfo.canCreate) {
            return NextResponse.json({
              success: false,
              code: 'PUBLISH_LIMIT_REACHED',
              message: `Free plan allows up to ${limitInfo.limit} published forms. Upgrade to Pro to publish more.`,
              data: { currentCount: limitInfo.currentCount, limit: limitInfo.limit }
            }, { status: 403 })
          }
        } catch (e) {
          console.warn('Form publish limit check failed (generic PUT); allowing publish by default:', e)
        }

        // Set publishedAt if not already set
        if (!existingForm.publishedAt) {
          formUpdates.publishedAt = new Date()
        }
        
        // Ensure we have a slug
        if (!existingForm.slug) {
          const baseSlug = existingForm.title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50)
          
          const timestamp = Date.now().toString(36)
          formUpdates.slug = `${baseSlug}-${timestamp}`
        } else {
          formUpdates.slug = existingForm.slug // Preserve existing slug
        }
        
        // Ensure public flags are set on publish
        formUpdates.isPublished = true
        formUpdates.isPublic = true

        // Generate absolute publishedUrl using request URL origin (header may be missing)
        const origin = (() => {
          try {
            return new URL(request.url).origin
          } catch {
            return process.env.NEXT_PUBLIC_APP_URL || ''
          }
        })()
        formUpdates.publishedUrl = `${origin}/forms/${formUpdates.slug}`
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
      
      // Invalidate cache
      formCache.delete(`form:${id}`)
      
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
        data: formWithFields,
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

      return NextResponse.json({
        success: true,
        message: 'Form deleted successfully'
      })
    })
  )
}
