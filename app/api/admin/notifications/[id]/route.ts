import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'
import { withRateLimit, apiRateLimit } from '@/lib/rate-limit'
import { withErrorHandling, AuthenticationError, AuthorizationError } from '@/lib/error-handler'

// Helper function to get admin user from request
async function getAdminUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Authentication required')
  }
  
  return { id: 'admin-user', role: 'admin' }
}

// PUT /api/admin/notifications/[id] - Mark notification as read
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        const adminUser = await getAdminUser(request)
        const { id } = await params
        
        const updatedNotification = await dbService.markNotificationAsRead(id)
        
        if (!updatedNotification) {
          return NextResponse.json({
            success: false,
            message: 'Notification not found'
          }, { status: 404 })
        }
        
        return NextResponse.json({
          success: true,
          data: updatedNotification
        })
        
      } catch (error) {
        if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
          return NextResponse.json({
            success: false,
            message: error.message
          }, { status: error.statusCode })
        }
        
        console.error('Mark notification as read error:', error)
        return NextResponse.json({
          success: false,
          message: 'Internal server error'
        }, { status: 500 })
      }
    })
  )
}

