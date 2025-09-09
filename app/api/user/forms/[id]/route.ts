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

  // Fallback: Authorization header with Bearer userId (e.g., Firebase UID)
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const uid = authHeader.replace('Bearer ', '')
    if (uid && uid !== 'anonymous') {
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
        }

        // Separate fields from other form updates
        const { fields, ...formUpdates } = body
        
        // Update the form, preserving the existing slug
        const updatedForm = await dbService.updateForm(id, {
          ...formUpdates,
          slug: form.slug, // Preserve the existing slug
          updatedAt: new Date()
        })
        
        // Invalidate cache
        const { formCache } = await import('@/lib/cache')
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
        
        // Verify the form belongs to the user
        const form = await dbService.getForm(id)
        if (!form || form.userId !== user.id) {
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

