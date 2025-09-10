import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'
import { authService } from '@/lib/auth/auth-service'
import { withRateLimit, apiRateLimit } from '@/lib/rate-limit'
import { withErrorHandling, AuthenticationError, AuthorizationError } from '@/lib/error-handler'
import { z } from 'zod'

// Validation schemas
const updateRoleSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.enum(['user', 'admin', 'super_admin'], {
    errorMap: () => ({ message: 'Role must be user, admin, or super_admin' })
  })
})

const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['user', 'admin'], {
    errorMap: () => ({ message: 'Role must be user or admin (super_admin cannot be created via API)' })
  }).default('user')
})

// Helper function to verify superadmin access
async function verifySuperAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Authentication required')
  }

  const token = authHeader.replace('Bearer ', '')
  const user = await authService.verifyToken(token)
  
  if (user.role !== 'super_admin') {
    throw new AuthorizationError('Super admin access required')
  }

  return user
}

// GET /api/admin/users - Get all users (superadmin only)
export async function GET(request: NextRequest) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        await verifySuperAdmin(request)
        
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const role = searchParams.get('role')
        
        const users = await dbService.getUsers({
          page,
          limit,
          role: role as 'user' | 'admin' | 'super_admin' | undefined
        })

        return NextResponse.json({
          success: true,
          data: users
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

// POST /api/admin/users - Create new user (superadmin only)
export async function POST(request: NextRequest) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        await verifySuperAdmin(request)
        
        const body = await request.json()
        const validatedData = createUserSchema.parse(body)
        
        // Generate a unique ID for the new user
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        const newUser = await dbService.createUser({
          id: userId,
          email: validatedData.email,
          firstName: validatedData.firstName || null,
          lastName: validatedData.lastName || null,
          role: validatedData.role,
          status: 'active',
          emailVerified: false
        })

        return NextResponse.json({
          success: true,
          data: newUser,
          message: 'User created successfully'
        }, { status: 201 })
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

// PUT /api/admin/users - Update user role (superadmin only)
export async function PUT(request: NextRequest) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        await verifySuperAdmin(request)
        
        const body = await request.json()
        const validatedData = updateRoleSchema.parse(body)
        
        const updatedUser = await dbService.updateUser(validatedData.userId, {
          role: validatedData.role
        })

        if (!updatedUser) {
          return NextResponse.json({
            success: false,
            message: 'User not found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          data: updatedUser,
          message: 'User role updated successfully'
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
