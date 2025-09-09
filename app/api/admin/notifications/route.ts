import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'
import { withRateLimit, apiRateLimit } from '@/lib/rate-limit'
import { withErrorHandling, AuthenticationError, AuthorizationError } from '@/lib/error-handler'
import { authService } from '@/lib/auth/auth-service'

// Helper function to get admin user from request
async function getAdminUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Authentication required: No Bearer token found.')
  }

  const token = authHeader.replace('Bearer ', '')
  
  try {
    // Verify the JWT token using auth service
    const user = await authService.verifyToken(token)
    
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      throw new AuthorizationError('Admin access required')
    }

    return { id: user.id, role: user.role }
  } catch (error) {
    throw new AuthenticationError('Invalid or expired token')
  }
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
