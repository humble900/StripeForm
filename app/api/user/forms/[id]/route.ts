import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'
import { withRateLimit, apiRateLimit } from '@/lib/rate-limit'
import { withErrorHandling, AuthenticationError } from '@/lib/error-handler'
import { AuthService } from '@/lib/auth/auth-service'

// Helper function to get user from request
async function getUserFromRequest(request: NextRequest) {
  // Prefer secure HTTP-only cookie token set at login
  const cookieToken = request.cookies.get('auth-token')?.value
  if (cookieToken) {
    const auth = new AuthService()
    const user = await auth.verifyToken(cookieToken)
    return { id: user.id, email: user.email }
  }

  // Fallback: Authorization header with Bearer userId (e.g., Firebase UID or fingerprint)
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const uid = authHeader.replace('Bearer ', '')
    if (uid) {
      // Allow both authenticated users and anonymous users (fingerprints)
      return { id: uid, email: 'user@example.com' }
    }
  }

  throw new AuthenticationError('Authentication required')
}

// GET /api/user/forms/[id] - Get a single form
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        const user = await getUserFromRequest(request)
        const { id } = await params
        
        // Verify the form belongs to the user, with optional migration from anonymous ownership
        let form = await dbService.getForm(id)
        if (!form) {
          return NextResponse.json({ success: false, message: 'Form not found' }, { status: 404 })
        }
        if (form.userId !== user.id) {
          // If the request includes a fingerprint header and the form belongs to that fingerprint,
          // migrate ownership to the authenticated user and proceed
          const fingerprint = request.headers.get('x-fingerprint') || ''
          if (fingerprint && form.userId === fingerprint) {
            await dbService.migrateAnonymousToAuthenticated(fingerprint, user.id)
            form = await dbService.getForm(id)
          }
        }
        if (!form || form.userId !== user.id) {
          return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 })
        }
        
        return NextResponse.json({
          success: true,
          data: form
        })
        
      } catch (error) {
        if (error instanceof AuthenticationError) {
          return NextResponse.json({
            success: false,
            message: error.message
          }, { status: error.statusCode })
        }
        
        console.error('Get form error:', error)
        return NextResponse.json({
          success: false,
          message: 'Internal server error'
        }, { status: 500 })
      }
    })
  )
}

// PATCH /api/user/forms/[id] - Update a form (e.g., archive)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        const user = await getUserFromRequest(request)
        const { id } = await params
        const body = await request.json()
        
        // Verify the form belongs to the user
        const form = await dbService.getForm(id)
        if (!form || form.userId !== user.id) {
          return NextResponse.json({
            success: false,
            message: 'Form not found or access denied'
          }, { status: 404 })
        }
        
        // Separate fields from other form updates
        const { fields, ...otherUpdates } = body
        
        // If attempting to publish, enforce free limit (5) for non-pro users
        if (body?.status === 'published') {
          try {
            const limitInfo = await dbService.canUserCreateForm(user.id)
            if (!limitInfo.canCreate) {
              return NextResponse.json({
                success: false,
                code: 'PUBLISH_LIMIT_REACHED',
                message: `Free plan allows up to ${limitInfo.limit} published forms. Upgrade to Pro to publish more.`,
                data: { currentCount: limitInfo.currentCount, limit: limitInfo.limit }
              }, { status: 403 })
            }
          } catch (e) {
            // If limit check fails unexpectedly, fail safe by allowing publish but log
            console.warn('Form publish limit check failed; allowing publish by default:', e)
          }
          
          // Comprehensive publishing field updates for user forms
          const now = new Date()
          otherUpdates.isPublished = true
          otherUpdates.isPublic = true
          otherUpdates.status = 'published'
          otherUpdates.updatedAt = now
          
          // Set publishedAt if not already set
          if (!form.publishedAt) {
            otherUpdates.publishedAt = now
          }
          
          // Generate publishedUrl if not already set
          if (!form.publishedUrl && form.slug) {
            const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://stripeform.com'
            otherUpdates.publishedUrl = `${origin}/forms/${form.slug}`
          }
          
          console.log('📤 Publishing user form with comprehensive updates:', {
            id: form.id,
            userId: user.id,
            status: otherUpdates.status,
            isPublished: otherUpdates.isPublished,
            isPublic: otherUpdates.isPublic,
            publishedAt: otherUpdates.publishedAt,
            publishedUrl: otherUpdates.publishedUrl
          })
        }
        
        // Update the form, preserving the existing slug
        const updatedForm = await dbService.updateForm(id, {
          ...otherUpdates,
          slug: form.slug, // Preserve the existing slug
          updatedAt: new Date()
        })
        
        // Comprehensive cache invalidation
        const { formCache } = await import('@/lib/cache')
        
        // Invalidate individual form cache
        formCache.delete(`form:${id}`)
        
        // Invalidate user forms cache for this user
        const userFormsCacheKeys = [
          `user-forms:${user.id}:all:50:0`,
          `user-forms:${user.id}:published:50:0`,
          `user-forms:${user.id}:draft:50:0`,
          `user-forms:${user.id}:archived:50:0`
        ]
        
        userFormsCacheKeys.forEach(key => {
          formCache.delete(key)
        })
        
        // If form was published, also invalidate analytics cache
        if (otherUpdates.status === 'published') {
          console.log('🔄 Invalidating analytics cache after form publication')
          // Clear any analytics-related caches
          const analyticsCacheKeys = [
            `analytics:${user.id}:30d`,
            `analytics:${user.id}:7d`,
            `analytics:${user.id}:90d`
          ]
          
          analyticsCacheKeys.forEach(key => {
            formCache.delete(key)
          })
        }
        
        return NextResponse.json({
          success: true,
          data: updatedForm,
          message: 'Form updated successfully'
        })
        
      } catch (error) {
        if (error instanceof AuthenticationError) {
          return NextResponse.json({
            success: false,
            message: error.message
          }, { status: error.statusCode })
        }
        
        console.error('Update form error:', error)
        return NextResponse.json({
          success: false,
          message: 'Internal server error'
        }, { status: 500 })
      }
    })
  )
}

// DELETE /api/user/forms/[id] - Delete a form
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        const user = await getUserFromRequest(request)
        const { id } = await params
        
        console.log('🗑️ Delete API: Attempting to delete form:', {
          formId: id,
          userId: user.id,
          userEmail: user.email
        })
        
        // Verify the form belongs to the user
        const form = await dbService.getForm(id)
        console.log('🗑️ Delete API: Form lookup result:', {
          formFound: !!form,
          formUserId: form?.userId,
          requestingUserId: user.id,
          ownershipMatch: form?.userId === user.id
        })
        
        if (!form || form.userId !== user.id) {
          console.log('❌ Delete API: Access denied - form not found or user mismatch')
          return NextResponse.json({
            success: false,
            message: 'Form not found or access denied'
          }, { status: 404 })
        }
        
        await dbService.deleteForm(id)
        
        // Invalidate cache
        const { formCache } = await import('@/lib/cache')
        formCache.delete(`form:${id}`)
        
        // Invalidate user forms cache for this user
        const userFormsCacheKeys = [
          `user-forms:${user.id}:all:50:0`,
          `user-forms:${user.id}:published:50:0`,
          `user-forms:${user.id}:draft:50:0`
        ]
        
        userFormsCacheKeys.forEach(key => {
          formCache.delete(key)
        })
        
        return NextResponse.json({
          success: true,
          message: 'Form deleted successfully'
        })
        
      } catch (error) {
        if (error instanceof AuthenticationError) {
          return NextResponse.json({
            success: false,
            message: error.message
          }, { status: error.statusCode })
        }
        
        console.error('Delete form error:', error)
        return NextResponse.json({
          success: false,
          message: 'Internal server error'
        }, { status: 500 })
      }
    })
  )
}

