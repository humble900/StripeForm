import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'
import { authService } from '@/lib/auth/auth-service'
import { withRateLimit, apiRateLimit } from '@/lib/rate-limit'
import { withErrorHandling, AuthenticationError, AuthorizationError } from '@/lib/error-handler'
import { z } from 'zod'

// Validation schemas
const updateFormSchema = z.object({
  status: z.enum(['draft', 'published', 'archived']).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional()
})

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

// GET /api/admin/forms/[id] - Get specific form (admin/superadmin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        await verifyAdminAccess(request)
        
        const { id } = await params
        
        const form = await dbService.getFormById(id)
        
        if (!form) {
          return NextResponse.json({
            success: false,
            message: 'Form not found'
          }, { status: 404 })
        }

        // Get user information
        let userInfo = null
        try {
          const user = await dbService.getUserById(form.userId)
          userInfo = {
            email: user?.email,
            name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : undefined
          }
        } catch {
          userInfo = {
            email: 'Unknown user',
            name: undefined
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            ...form,
            userInfo
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

// PUT /api/admin/forms/[id] - Update form (admin/superadmin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        await verifyAdminAccess(request)
        
        const { id } = await params
        const body = await request.json()
        const validatedData = updateFormSchema.parse(body)
        
        const updatedForm = await dbService.updateForm(id, validatedData)

        if (!updatedForm) {
          return NextResponse.json({
            success: false,
            message: 'Form not found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          data: updatedForm,
          message: 'Form updated successfully'
        })
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json({
            success: false,
            message: 'Validation error',
            errors: error.errors
          }, { status: 400 })
        }
        
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

// DELETE /api/admin/forms/[id] - Delete form (superadmin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        const authHeader = request.headers.get('authorization')
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          throw new AuthenticationError('Authentication required')
        }

        const token = authHeader.replace('Bearer ', '')
        const user = await authService.verifyToken(token)
        
        if (user.role !== 'super_admin') {
          throw new AuthorizationError('Super admin access required for form deletion')
        }
        
        const { id } = await params
        
        const deleted = await dbService.deleteForm(id)

        if (!deleted) {
          return NextResponse.json({
            success: false,
            message: 'Form not found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: 'Form deleted successfully'
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
