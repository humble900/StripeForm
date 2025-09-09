import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'
import { withRateLimit, apiRateLimit } from '@/lib/rate-limit'
import { withErrorHandling, AuthenticationError } from '@/lib/error-handler'

// Helper function to get user from request
async function getUserFromRequest(request: NextRequest) {
  // Prefer cookie-based auth (JWT set by our auth routes)
  const cookieToken = request.cookies.get('auth-token')?.value
  if (cookieToken) {
    return { id: cookieToken, email: 'user@example.com' }
  }
  // Fallback: Authorization header with Bearer userId (fingerprint or uid)
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '')
    if (token && token !== 'anonymous') {
      return { id: token, email: 'user@example.com' }
    }
  }
  throw new AuthenticationError('Authentication required')
}

// GET /api/user/forms - Get user's forms
// POST /api/user/forms - Create a new form
export async function POST(request: NextRequest) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        const user = await getUserFromRequest(request)
        const body = await request.json()
        
        // Ensure we have a title
        const title: string = (body.title && String(body.title).trim().length > 0)
          ? String(body.title)
          : 'Untitled Form'

        // Generate unique slug with timestamp and random suffix
        const baseSlug = title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 40) // Leave room for timestamp and random
        
        const timestamp = Date.now().toString(36)
        const random = Math.random().toString(36).substring(2, 8) // Add random component
        const slug = `${baseSlug}-${timestamp}${random}`
        
        // Create the form
        const form = await dbService.createForm({
          ...body,
          title,
          slug,
          userId: user.id,
          status: 'draft',
          isPublic: false,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        
        return NextResponse.json({
          success: true,
          data: form,
          message: 'Form created successfully'
        }, { status: 201 })
        
      } catch (error) {
        if (error instanceof AuthenticationError) {
          return NextResponse.json({
            success: false,
            message: error.message
          }, { status: error.statusCode })
        }
        
        console.error('Create form error:', error)
        return NextResponse.json({
          success: false,
          message: 'Internal server error'
        }, { status: 500 })
      }
    })
  )
}

export async function GET(request: NextRequest) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        const user = await getUserFromRequest(request)
        const { searchParams } = new URL(request.url)
        const summary = searchParams.get('summary') === 'true'

        const forms = summary
          ? await dbService.getUserFormsSummary(user.id)
          : await dbService.getUserForms(user.id)

        return NextResponse.json({
          success: true,
          data: forms
        })
        
      } catch (error) {
        if (error instanceof AuthenticationError) {
          return NextResponse.json({
            success: false,
            message: error.message
          }, { status: error.statusCode })
        }
        
        console.error('Get user forms error:', error)
        return NextResponse.json({
          success: false,
          message: 'Internal server error'
        }, { status: 500 })
      }
    })
  )
}

