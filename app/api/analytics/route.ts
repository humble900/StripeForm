import { NextRequest, NextResponse } from 'next/server'
import { dbService as db } from '@/lib/db'
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

// GET /api/analytics - Get analytics data for a user
export async function GET(request: NextRequest) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        const user = await getUserFromRequest(request)
        const { searchParams } = new URL(request.url)
        const requestedUserId = searchParams.get('userId')
        const period = searchParams.get('period') || '30d' // 7d, 30d, 90d, 1y

        // Use authenticated user's ID, not the requested userId for security
        const userId = user.id

        if (!userId) {
          return NextResponse.json(
            { error: 'User authentication required' },
            { status: 401 }
          )
        }

        // Get user's forms using optimized summary method
        const forms = await db.getUserFormsSummary(userId)
        
        // Get form submissions for analytics
        const submissions = await db.getUserFormSubmissions(userId)
        
        // Calculate analytics
        const analytics = {
          totalForms: forms.length,
          totalSubmissions: submissions.length,
          publishedForms: forms.filter(f => f.status === 'published').length,
          draftForms: forms.filter(f => f.status === 'draft').length,
          archivedForms: forms.filter(f => f.status === 'archived').length,
          averageSubmissionsPerForm: forms.length > 0 ? (submissions.length / forms.length).toFixed(2) : 0,
          topPerformingForms: forms
            .map(form => ({
              id: form.id,
              title: form.title,
              submissionCount: submissions.filter(s => s.formId === form.id).length
            }))
            .sort((a, b) => b.submissionCount - a.submissionCount)
            .slice(0, 5)
        }

        return NextResponse.json({
          success: true,
          analytics,
          period
        })

      } catch (error) {
        if (error instanceof AuthenticationError) {
          return NextResponse.json({
            success: false,
            message: error.message
          }, { status: error.statusCode })
        }
        
        console.error('Get analytics error:', error)
        return NextResponse.json(
          { error: (error as Error)?.message || 'Internal Server Error' },
          { status: 500 }
        )
      }
    })
  )
}



