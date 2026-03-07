import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'
import { withRateLimit, apiRateLimit } from '@/lib/rate-limit'
import { withErrorHandling, AuthenticationError, AuthorizationError } from '@/lib/error-handler'
import { authService } from '@/lib/auth/auth-service'

async function getAdminUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Authentication required')
  }
  const token = authHeader.replace('Bearer ', '')
  try {
    const user = await authService.verifyToken(token)
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      throw new AuthorizationError('Admin access required')
    }
    return user
  } catch (error) {
    throw new AuthenticationError('Invalid or expired token')
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        const adminUser = await getAdminUser(request)
        const { id } = await params

        const ticket = await dbService.getSupportTicketById(id)
        if (!ticket) {
          return NextResponse.json({ success: false, message: 'Ticket not found' }, { status: 404 })
        }

        const body = await request.json()
        const { message, isInternal, attachments } = body

        if (!message) {
          return NextResponse.json({ success: false, message: 'Message content is required' }, { status: 400 })
        }

        const newMessage = await dbService.addTicketMessage({
          ticketId: id,
          userId: adminUser.id,
          userEmail: adminUser.email,
          userName: 'Admin',
          message,
          isInternal: isInternal || false,
          attachments: attachments || []
        })

        // Also update the ticket status if reacting publicly
        await dbService.updateSupportTicket(id, {
          status: isInternal ? ticket.status : 'in_progress',
        })

        return NextResponse.json({
          success: true,
          data: newMessage
        }, { status: 201 })

      } catch (error) {
        if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
          return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode })
        }
        console.error('Create ticket message error:', error)
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
      }
    })
  )
}
