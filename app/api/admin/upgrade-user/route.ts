import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'
import { authService } from '@/lib/auth/auth-service'
import { withRateLimit, apiRateLimit } from '@/lib/rate-limit'
import { withErrorHandling, AuthenticationError, AuthorizationError } from '@/lib/error-handler'
import { z } from 'zod'

// Validation schema
const upgradeUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  subscriptionTier: z.enum(['pro', 'enterprise']),
  subscriptionStatus: z.enum(['active', 'inactive', 'canceled', 'past_due', 'unpaid']).default('active'),
  subscriptionExpiresAt: z.string().optional(),
  stripeCustomerId: z.string().optional(),
  reason: z.string().optional()
})

// Helper function to verify super admin access
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

// POST /api/admin/upgrade-user - Manually upgrade user subscription (superadmin only)
export async function POST(request: NextRequest) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        await verifySuperAdmin(request)
        
        const body = await request.json()
        const validatedData = upgradeUserSchema.parse(body)
        
        // Get user by email
        const user = await dbService.getUserByEmail(validatedData.email)
        if (!user) {
          return NextResponse.json({
            success: false,
            message: 'User not found'
          }, { status: 404 })
        }

        // Calculate expiration date if not provided
        let expiresAt = validatedData.subscriptionExpiresAt
        if (!expiresAt && validatedData.subscriptionStatus === 'active') {
          // Default to 1 month from now for pro subscriptions
          const expirationDate = new Date()
          expirationDate.setMonth(expirationDate.getMonth() + 1)
          expiresAt = expirationDate.toISOString()
        }

        // Update user subscription
        const updatedUser = await dbService.updateUserSubscription(user.id, {
          subscriptionTier: validatedData.subscriptionTier,
          subscriptionStatus: validatedData.subscriptionStatus,
          subscriptionExpiresAt: expiresAt ? new Date(expiresAt) : null,
          stripeCustomerId: validatedData.stripeCustomerId || null
        })

        if (!updatedUser) {
          return NextResponse.json({
            success: false,
            message: 'Failed to update user subscription'
          }, { status: 500 })
        }

        // Log the upgrade action
        console.log(`🔧 Manual subscription upgrade: ${validatedData.email} -> ${validatedData.subscriptionTier} (${validatedData.subscriptionStatus})`, {
          reason: validatedData.reason,
          upgradedBy: 'super_admin',
          timestamp: new Date().toISOString()
        })

        return NextResponse.json({
          success: true,
          data: {
            user: {
              id: updatedUser.id,
              email: updatedUser.email,
              firstName: updatedUser.firstName,
              lastName: updatedUser.lastName,
              subscriptionTier: updatedUser.subscriptionTier,
              subscriptionStatus: updatedUser.subscriptionStatus,
              subscriptionExpiresAt: updatedUser.subscriptionExpiresAt,
              stripeCustomerId: updatedUser.stripeCustomerId
            },
            upgrade: {
              tier: validatedData.subscriptionTier,
              status: validatedData.subscriptionStatus,
              expiresAt: expiresAt,
              reason: validatedData.reason
            }
          },
          message: `User ${validatedData.email} upgraded to ${validatedData.subscriptionTier} successfully`
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
