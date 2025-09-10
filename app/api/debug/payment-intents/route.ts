import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'Email parameter is required'
      }, { status: 400 })
    }

    // Get user by email
    const user = await dbService.getUserByEmail(email)
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }

    // Get all payment intents
    const allPaymentIntents = await dbService.getPaymentIntents()
    
    // Filter payment intents for this user
    const userPaymentIntents = allPaymentIntents.filter(payment => 
      payment.userId === user.id
    )

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        stripeCustomerId: user.stripeCustomerId
      },
      paymentIntents: userPaymentIntents.map(payment => ({
        id: payment.id,
        stripePaymentIntentId: payment.stripePaymentIntentId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        userId: payment.userId,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      })),
      totalPayments: userPaymentIntents.length,
      successfulPayments: userPaymentIntents.filter(p => p.status === 'completed').length
    })

  } catch (error) {
    console.error('Debug payment intents error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
