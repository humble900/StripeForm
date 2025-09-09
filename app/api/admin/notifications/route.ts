import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'
import { withRateLimit, apiRateLimit } from '@/lib/rate-limit'
import { withErrorHandling, AuthenticationError, AuthorizationError } from '@/lib/error-handler'

// Helper function to get admin user from request
async function getAdminUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  let userId: string | undefined

  if (authHeader && authHeader.startsWith('Bearer ')) {
    userId = authHeader.replace('Bearer ', '')
  } else if (process.env.ADMIN_TEST_USER_ID) {
    userId = process.env.ADMIN_TEST_USER_ID
  }

  if (!userId) {
    throw new AuthenticationError('Authentication required: No user ID found in token or ADMIN_TEST_USER_ID.')
  }

  const user = await dbService.getUser(userId)

  if (!user) {
    throw new AuthenticationError(`User not found with ID: ${userId}`)
  }

  if (user.role !== 'admin' && user.role !== 'super_admin') {
    throw new AuthorizationError('Admin access required')
  }

  return { id: user.id, role: user.role }
}

// GET /api/admin/notifications - Get notifications
export async function GET(request: NextRequest) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        const adminUser = await getAdminUser(request)
        
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const type = searchParams.get('type')
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
        
        const notifications = await dbService.getNotifications(undefined, {
          status: status as any,
          type: type || undefined,
          limit
        })
        
        const unreadCount = await dbService.getUnreadNotificationCount()
        
        return NextResponse.json({
          success: true,
          data: {
            notifications,
            unreadCount
          }
        })
        
      } catch (error) {
        if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
          return NextResponse.json({
            success: false,
            message: error.message
          }, { status: error.statusCode })
        }
        
        console.error('Get notifications error:', error)
        return NextResponse.json({
          success: false,
          message: 'Internal server error'
        }, { status: 500 })
      }
    })
  )
}
