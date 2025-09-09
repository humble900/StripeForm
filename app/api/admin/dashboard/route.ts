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
    // In production, verify the Firebase JWT token and extract user ID
    // For now, we trust the token to contain the Firebase UID directly
  } else if (process.env.ADMIN_TEST_USER_ID) {
    // Fallback for local testing if ADMIN_TEST_USER_ID is set
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

export async function GET(request: NextRequest) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        // Get current admin user
        const adminUser = await getAdminUser(request)
        
        // Get query parameters
        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || 'month'
        
        // Calculate date range
        const now = new Date()
        let startDate: Date
        
        switch (period) {
          case 'day':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
            break
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
          case 'year':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
            break
          default:
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
        
        // Get system statistics using Drizzle
        const [
          totalUsers,
          totalForms,
          totalSubmissions,
          totalPaymentIntents,
          totalTickets,
          totalNotifications
        ] = await Promise.all([
          // Total counts
          dbService.getUsers(),
          dbService.getForms(),
          dbService.getAllFormSubmissions(),
          dbService.getPaymentIntents(),
          dbService.getSupportTickets(),
          dbService.getNotifications()
        ])
        
        // Filter by date for period statistics
        const newUsersThisPeriod = totalUsers.filter(user => 
          new Date(user.createdAt) >= startDate
        )
        
        const newFormsThisPeriod = totalForms.filter(form => 
          new Date(form.createdAt) >= startDate
        )
        
        const newSubmissionsThisPeriod = totalSubmissions.filter(submission => 
          new Date(submission.submittedAt) >= startDate
        )
        
        const newPaymentsThisPeriod = totalPaymentIntents.filter(payment => 
          new Date(payment.createdAt) >= startDate
        )
        
        const newTicketsThisPeriod = totalTickets.filter(ticket => 
          new Date(ticket.createdAt) >= startDate
        )
        
        const newNotificationsThisPeriod = totalNotifications.filter(notification => 
          new Date(notification.createdAt) >= startDate
        )
        
        // Get user statistics by role
        const userStats = totalUsers.reduce((acc, user) => {
          const role = user.role || 'user'
          acc[role] = (acc[role] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        // Get form statistics by status
        const formStats = totalForms.reduce((acc, form) => {
          const status = form.status || 'draft'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        // Get submission statistics by status
        const submissionStats = totalSubmissions.reduce((acc, submission) => {
          const status = submission.status || 'pending'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        // Get payment statistics by status
        const paymentStats = totalPaymentIntents.reduce((acc, payment) => {
          const status = payment.status || 'pending'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        // Get ticket statistics by status
        const ticketStats = totalTickets.reduce((acc, ticket) => {
          const status = ticket.status || 'open'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        // Get ticket statistics by priority
        const ticketPriorityStats = totalTickets.reduce((acc, ticket) => {
          const priority = ticket.priority || 'medium'
          acc[priority] = (acc[priority] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        // Get notification statistics by status
        const notificationStats = totalNotifications.reduce((acc, notification) => {
          const status = notification.status || 'unread'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        // Get notification statistics by type
        const notificationTypeStats = totalNotifications.reduce((acc, notification) => {
          const type = notification.type || 'system_alert'
          acc[type] = (acc[type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        // Get top forms by submissions
        const topForms = totalForms.map(form => {
          const submissionCount = totalSubmissions.filter(
            submission => submission.formId === form.id
          ).length
          
          return {
            formId: form.id,
            title: form.title,
            submissionCount
          }
        })
        .sort((a, b) => b.submissionCount - a.submissionCount)
        .slice(0, 10)
        
        // Get recent activity
        const recentSubmissions = totalSubmissions
          .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
          .slice(0, 20)
          .map(submission => {
            const form = totalForms.find(f => f.id === submission.formId)
            return {
              id: submission.id,
              formId: submission.formId,
              formTitle: form?.title || 'Unknown Form',
              submittedAt: submission.submittedAt,
              status: submission.status
            }
          })
        
        // Get recent tickets
        const recentTickets = totalTickets
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10)
          .map(ticket => ({
            id: ticket.id,
            ticketNumber: ticket.ticketNumber,
            subject: ticket.subject,
            userEmail: ticket.userEmail,
            status: ticket.status,
            priority: ticket.priority,
            createdAt: ticket.createdAt
          }))
        
        // Get recent notifications
        const recentNotifications = totalNotifications
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10)
          .map(notification => ({
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            status: notification.status,
            createdAt: notification.createdAt
          }))
        
        // Calculate revenue (if super admin)
        let revenue = null
        if (adminUser.role === 'super_admin') {
          revenue = totalPaymentIntents
            .filter(payment => payment.status === 'completed')
            .reduce((sum, payment) => sum + (payment.amount || 0), 0)
        }
        
        return NextResponse.json({
          success: true,
          data: {
            period,
            startDate: startDate.toISOString(),
            endDate: now.toISOString(),
            statistics: {
              total: {
                users: totalUsers.length,
                forms: totalForms.length,
                submissions: totalSubmissions.length,
                payments: totalPaymentIntents.length,
                tickets: totalTickets.length,
                notifications: totalNotifications.length
              },
              newThisPeriod: {
                users: newUsersThisPeriod.length,
                forms: newFormsThisPeriod.length,
                submissions: newSubmissionsThisPeriod.length,
                payments: newPaymentsThisPeriod.length,
                tickets: newTicketsThisPeriod.length,
                notifications: newNotificationsThisPeriod.length
              }
            },
            breakdowns: {
              users: Object.entries(userStats).map(([role, count]) => ({ role, count })),
              forms: Object.entries(formStats).map(([status, count]) => ({ status, count })),
              submissions: Object.entries(submissionStats).map(([status, count]) => ({ status, count })),
              payments: Object.entries(paymentStats).map(([status, count]) => ({ status, count })),
              tickets: Object.entries(ticketStats).map(([status, count]) => ({ status, count })),
              ticketPriorities: Object.entries(ticketPriorityStats).map(([priority, count]) => ({ priority, count })),
              notifications: Object.entries(notificationStats).map(([status, count]) => ({ status, count })),
              notificationTypes: Object.entries(notificationTypeStats).map(([type, count]) => ({ type, count }))
            },
            topForms,
            recentActivity: recentSubmissions,
            recentTickets,
            recentNotifications,
            revenue
          }
        })
        
      } catch (error) {
        if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
          return NextResponse.json({
            success: false,
            message: error.message
          }, { status: error.statusCode })
        }
        
        console.error('Admin dashboard error:', error)
        return NextResponse.json({
          success: false,
          message: 'Internal server error'
        }, { status: 500 })
      }
    })
  )
}
