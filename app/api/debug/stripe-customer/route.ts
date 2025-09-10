import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { dbService } from '@/lib/db/service'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

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

    // Get user from database
    const user = await dbService.getUserByEmail(email)
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }

    // Search for Stripe customers by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 10
    })

    let customerData = null
    let subscriptions = []
    let paymentIntents = []

    if (customers.data.length > 0) {
      const customer = customers.data[0] // Get the first customer
      customerData = {
        id: customer.id,
        email: customer.email,
        created: customer.created,
        default_source: customer.default_source,
        metadata: customer.metadata
      }

      // Get subscriptions for this customer
      const customerSubscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 10
      })
      subscriptions = customerSubscriptions.data.map(sub => ({
        id: sub.id,
        status: sub.status,
        current_period_start: sub.current_period_start,
        current_period_end: sub.current_period_end,
        items: sub.items.data.map(item => ({
          price_id: item.price.id,
          product_id: item.price.product
        }))
      }))

      // Get payment intents for this customer
      const customerPayments = await stripe.paymentIntents.list({
        customer: customer.id,
        limit: 10
      })
      paymentIntents = customerPayments.data.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        created: payment.created,
        metadata: payment.metadata
      }))
    }

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
      stripeCustomer: customerData,
      subscriptions,
      paymentIntents,
      hasStripeCustomer: customers.data.length > 0,
      totalSubscriptions: subscriptions.length,
      totalPayments: paymentIntents.length,
      successfulPayments: paymentIntents.filter(p => p.status === 'succeeded').length
    })

  } catch (error) {
    console.error('Debug Stripe customer error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
