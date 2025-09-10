import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'
import { authService } from '@/lib/auth/auth-service'
import { withRateLimit, apiRateLimit } from '@/lib/rate-limit'
import { withErrorHandling, AuthenticationError, AuthorizationError } from '@/lib/error-handler'

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

// POST /api/admin/fix-subscription - Manually fix user subscription
export async function POST(request: NextRequest) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        await verifySuperAdmin(request)
        
        const body = await request.json()
        const { email, subscriptionTier, subscriptionStatus, subscriptionExpiresAt } = body
        
        if (!email) {
          return NextResponse.json({
            success: false,
            error: 'Email is required'
          }, { status: 400 })
        }
        
        // Find user by email
        const user = await dbService.getUserByEmail(email)
        
        if (!user) {
          return NextResponse.json({
            success: false,
            error: 'User not found'
          }, { status: 404 })
        }
        
        // Update subscription
        const updatedUser = await dbService.updateUserSubscription(user.id, {
          subscriptionTier: subscriptionTier || 'pro',
          subscriptionStatus: subscriptionStatus || 'active',
          subscriptionExpiresAt: subscriptionExpiresAt ? new Date(subscriptionExpiresAt) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        })
        
        return NextResponse.json({
          success: true,
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            subscriptionTier: updatedUser.subscriptionTier,
            subscriptionStatus: updatedUser.subscriptionStatus,
            subscriptionExpiresAt: updatedUser.subscriptionExpiresAt
          },
          message: 'Subscription updated successfully'
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
