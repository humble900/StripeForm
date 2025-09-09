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

// POST /api/admin/support-tickets/[id]/messages - Add message to ticket
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        const adminUser = await getAdminUser(request)
        const { id } = await params
        
        const body = await request.json()
        const { message, isInternal, attachments } = body
        
        if (!message) {
          return NextResponse.json({
            success: false,
            message: 'Message is required'
          }, { status: 400 })
        }
        
        const newMessage = await dbService.addTicketMessage({
          ticketId: id,
          userId: adminUser.id,
          userEmail: 'admin@stripeform.app',
          userName: 'Admin',
          message,
          isInternal: isInternal || false,
          attachments: attachments || []
        })
        
        // Update ticket's updatedAt timestamp
        await dbService.updateSupportTicket(id, {})
        
        return NextResponse.json({
          success: true,
          data: newMessage
        }, { status: 201 })
        
      } catch (error) {
        if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
          return NextResponse.json({
            success: false,
            message: error.message
          }, { status: error.statusCode })
        }
        
        console.error('Add ticket message error:', error)
        return NextResponse.json({
          success: false,
          message: 'Internal server error'
        }, { status: 500 })
      }
    })
  )
}

