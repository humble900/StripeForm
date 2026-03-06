import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'
import { withRateLimit, apiRateLimit } from '@/lib/rate-limit'
import { withErrorHandling, AuthenticationError } from '@/lib/error-handler'

// Helper function to get user from request
async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Authentication required')
  }

  const token = authHeader.replace('Bearer ', '')

  // For now, use the token as the user ID (this should be improved with proper JWT validation)
  // In a real implementation, you would decode the JWT token and extract user info
  return { id: token, email: 'user@example.com' }
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

        // Verify the form belongs to the user
        const form = await dbService.getForm(id)
        if (!form || form.userId !== user.id) {
          return NextResponse.json({
            success: false,
            message: 'Form not found or access denied'
          }, { status: 404 })
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

        // Parse string dates into actual Date objects for Drizzle ORM
        const dateFields = ['publishedAt', 'updatedAt', 'expiresAt', 'createdAt']
        for (const field of dateFields) {
          if (typeof body[field] === 'string') {
            const parsed = new Date(body[field])
            if (!isNaN(parsed.getTime())) {
              body[field] = parsed
            } else {
              delete body[field]
            }
          }
        }

        // Update the form, preserving the existing slug
        const updatedForm = await dbService.updateForm(id, {
          ...body,
          slug: form.slug, // Preserve the existing slug
          updatedAt: new Date()
        })

        // Get the complete updated form with fields
        const completeForm = await dbService.getForm(id)

        // Invalidate cache
        const { formCache } = await import('@/lib/cache')
        formCache.delete(`form:${id}`)
        if (completeForm && completeForm.slug) {
          formCache.delete(`form:${completeForm.slug}`)
        }

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
          data: completeForm,
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
        if (form && form.slug) {
          formCache.delete(`form:${form.slug}`)
        }

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

