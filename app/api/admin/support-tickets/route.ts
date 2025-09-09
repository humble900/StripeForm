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

// GET /api/admin/support-tickets - Get all support tickets
export async function GET(request: NextRequest) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        const adminUser = await getAdminUser(request)
        
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const priority = searchParams.get('priority')
        const category = searchParams.get('category')
        const assignedTo = searchParams.get('assignedTo')
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
        const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
        
        const tickets = await dbService.getSupportTickets({
          status: status || undefined,
          priority: priority || undefined,
          category: category || undefined,
          assignedTo: assignedTo || undefined,
          limit,
          offset
        })
        
        return NextResponse.json({
          success: true,
          data: tickets
        })
        
      } catch (error) {
        if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
          return NextResponse.json({
            success: false,
            message: error.message
          }, { status: error.statusCode })
        }
        
        console.error('Admin support tickets error:', error)
        return NextResponse.json({
          success: false,
          message: 'Internal server error'
        }, { status: 500 })
      }
    })
  )
}

// POST /api/admin/support-tickets - Create a new support ticket
export async function POST(request: NextRequest) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        const body = await request.json()
        const { userEmail, userName, subject, description, category, priority, tags, metadata } = body
        
        if (!userEmail || !subject || !description) {
          return NextResponse.json({
            success: false,
            message: 'Missing required fields: userEmail, subject, description'
          }, { status: 400 })
        }
        
        const ticket = await dbService.createSupportTicket({
          userEmail,
          userName,
          subject,
          description,
          category,
          priority,
          tags,
          metadata
        })
        
        // Create notification for admins
        await dbService.createNotification({
          type: 'ticket_created',
          title: 'New Support Ticket',
          message: `New ticket #${ticket.ticketNumber} from ${userEmail}: ${subject}`,
          data: { ticketId: ticket.id, ticketNumber: ticket.ticketNumber }
        })
        
        return NextResponse.json({
          success: true,
          data: ticket
        }, { status: 201 })
        
      } catch (error) {
        console.error('Create support ticket error:', error)
        return NextResponse.json({
          success: false,
          message: 'Internal server error'
        }, { status: 500 })
      }
    })
  )
}
