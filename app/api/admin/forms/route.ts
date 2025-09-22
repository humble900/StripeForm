import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'
import { authService } from '@/lib/auth/auth-service'
import { withRateLimit, apiRateLimit } from '@/lib/rate-limit'
import { withErrorHandling, AuthenticationError, AuthorizationError } from '@/lib/error-handler'

// Helper function to verify admin access
async function verifyAdminAccess(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Authentication required')
  }

  const token = authHeader.replace('Bearer ', '')
  const user = await authService.verifyToken(token)
  
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    throw new AuthorizationError('Admin access required')
  }

  return user
}

// GET /api/admin/forms - Get all forms (admin/superadmin only)
export async function GET(request: NextRequest) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        await verifyAdminAccess(request)
        
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const status = searchParams.get('status')
        const userId = searchParams.get('userId')
        
        // Get forms with pagination and filtering 
        const allForms = await dbService.getForms()
        
        // Apply filtering and pagination manually
        let forms = allForms
        
        // Filter by status if provided
        if (status) {
          forms = forms.filter(form => form.status === status)
        }
        
        // Filter by userId if provided
        if (userId) {
          forms = forms.filter(form => form.userId === userId)
        }
        
        // Apply pagination
        const startIndex = page * limit
        const endIndex = startIndex + limit
        forms = forms.slice(startIndex, endIndex)

        // Get user information for each form
        const formsWithUserInfo = await Promise.all(
          forms.map(async (form) => {
            try {
              const user = await dbService.getUser(form.userId)
              return {
                ...form,
                userEmail: user?.email,
                userName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : undefined
              }
            } catch {
              return {
                ...form,
                userEmail: 'Unknown user',
                userName: undefined
              }
            }
          })
        )

        return NextResponse.json({
          success: true,
          data: {
            forms: formsWithUserInfo,
            pagination: {
              page,
              limit,
              total: allForms.length,
              totalPages: Math.ceil(allForms.length / limit)
            }
          }
        })
      } catch (error) {
        if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
          return NextResponse.json({
            success: false,
            message: error.message
          }, { status: error.statusCode })
        }
        
        throw error
      }
    })
  )
}
