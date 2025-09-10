import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { dbService as db } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    console.log('Webhook event received:', event.type)

    switch (event.type) {
      // Payment Intent Events
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break
      
      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent)
        break
      
      case 'payment_intent.requires_action':
        await handlePaymentIntentRequiresAction(event.data.object as Stripe.PaymentIntent)
        break
      
      // Charge Events
      case 'charge.captured':
        await handleChargeCaptured(event.data.object as Stripe.Charge)
        break
      
      case 'charge.expired':
        await handleChargeExpired(event.data.object as Stripe.Charge)
        break
      
      case 'charge.failed':
        await handleChargeFailed(event.data.object as Stripe.Charge)
        break
      
      case 'charge.pending':
        await handleChargePending(event.data.object as Stripe.Charge)
        break
      
      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object as Stripe.Charge)
        break
      
      case 'charge.updated':
        await handleChargeUpdated(event.data.object as Stripe.Charge)
        break
      
      case 'charge.dispute.created':
        await handleChargeDisputeCreated(event.data.object as Stripe.Dispute)
        break
      
      case 'charge.dispute.updated':
        await handleChargeDisputeUpdated(event.data.object as Stripe.Dispute)
        break
      
      case 'charge.dispute.closed':
        await handleChargeDisputeClosed(event.data.object as Stripe.Dispute)
        break
      
      // Customer Events
      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer)
        break
      
      case 'customer.updated':
        await handleCustomerUpdated(event.data.object as Stripe.Customer)
        break
      
      case 'customer.deleted':
        await handleCustomerDeleted(event.data.object as Stripe.Customer)
        break
      
      // Subscription Events
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      
      case 'customer.subscription.trial_will_end':
        await handleSubscriptionTrialWillEnd(event.data.object as Stripe.Subscription)
        break
      
      // Invoice Events
      case 'invoice.created':
        await handleInvoiceCreated(event.data.object as Stripe.Invoice)
        break
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      
      case 'invoice.upcoming':
        await handleInvoiceUpcoming(event.data.object as Stripe.Invoice)
        break
      
      // Refund Events
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge)
        break
      
      case 'refund.created':
        await handleRefundCreated(event.data.object as Stripe.Refund)
        break
      
      case 'refund.updated':
        await handleRefundUpdated(event.data.object as Stripe.Refund)
        break
      
      // Account Events
      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account)
        break
      
      // Setup Intent Events
      case 'setup_intent.succeeded':
        await handleSetupIntentSucceeded(event.data.object as Stripe.SetupIntent)
        break
      
      case 'setup_intent.setup_failed':
        await handleSetupIntentSetupFailed(event.data.object as Stripe.SetupIntent)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (err: any) {
    console.error('Webhook error:', err)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    await db.updatePaymentIntent(
      paymentIntent.id,
      { status: 'succeeded' }
    )
    console.log(`Payment intent ${paymentIntent.id} marked as succeeded`)
  } catch (error) {
    console.error('Error updating payment intent:', error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    await db.updatePaymentIntent(
      paymentIntent.id,
      { status: 'failed' }
    )
    console.log(`Payment intent ${paymentIntent.id} marked as failed`)
  } catch (error) {
    console.error('Error updating payment intent:', error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    // Update user subscription status in database
    if (subscription.metadata?.user_id) {
      const { dbService } = await import('@/lib/db/service')
      
      // Determine subscription tier based on price ID
      const priceId = subscription.items.data[0]?.price.id
      let subscriptionTier = 'free'
      
      if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || 
          priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID) {
        subscriptionTier = 'pro'
      }
      
      // Calculate expiration date
      const expiresAt = new Date(subscription.current_period_end * 1000)
      
      await dbService.updateUserSubscription(subscription.metadata.user_id, {
        subscriptionTier: subscriptionTier as 'free' | 'pro' | 'enterprise',
        subscriptionStatus: subscription.status as 'active' | 'inactive' | 'canceled' | 'past_due' | 'unpaid',
        subscriptionExpiresAt: expiresAt,
        stripeCustomerId: subscription.customer as string
      })
      
      console.log(`Subscription created for user ${subscription.metadata.user_id}: ${subscriptionTier}`)
    }
  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    // Update subscription status in database
    if (subscription.metadata?.user_id) {
      const { dbService } = await import('@/lib/db/service')
      
      // Determine subscription tier based on price ID
      const priceId = subscription.items.data[0]?.price.id
      let subscriptionTier = 'free'
      
      if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || 
          priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID) {
        subscriptionTier = 'pro'
      }
      
      // Calculate expiration date
      const expiresAt = new Date(subscription.current_period_end * 1000)
      
      await dbService.updateUserSubscription(subscription.metadata.user_id, {
        subscriptionTier: subscriptionTier as 'free' | 'pro' | 'enterprise',
        subscriptionStatus: subscription.status as 'active' | 'inactive' | 'canceled' | 'past_due' | 'unpaid',
        subscriptionExpiresAt: expiresAt,
        stripeCustomerId: subscription.customer as string
      })
      
      console.log(`Subscription updated for user ${subscription.metadata.user_id}: ${subscriptionTier}`)
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    // Update subscription status in database
    if (subscription.metadata?.user_id) {
      const { dbService } = await import('@/lib/db/service')
      
      await dbService.updateUserSubscription(subscription.metadata.user_id, {
        subscriptionTier: 'free',
        subscriptionStatus: 'canceled',
        subscriptionExpiresAt: null
      })
      
      console.log(`Subscription deleted for user ${subscription.metadata.user_id}`)
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

// Additional Payment Intent Handlers
async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    await db.updatePaymentIntent(
      paymentIntent.id,
      { status: 'canceled' }
    )
    console.log(`Payment intent ${paymentIntent.id} marked as canceled`)
  } catch (error) {
    console.error('Error updating payment intent:', error)
  }
}

async function handlePaymentIntentRequiresAction(paymentIntent: Stripe.PaymentIntent) {
  try {
    await db.updatePaymentIntent(
      paymentIntent.id,
      { status: 'requires_action' }
    )
    console.log(`Payment intent ${paymentIntent.id} requires action`)
  } catch (error) {
    console.error('Error updating payment intent:', error)
  }
}

// Charge Event Handlers
async function handleChargeCaptured(charge: Stripe.Charge) {
  try {
    console.log(`Charge ${charge.id} captured for amount ${charge.amount}`)
    // Update charge status in database if you have a charges table
    // await db.updateCharge(charge.id, { status: 'captured' })
  } catch (error) {
    console.error('Error handling charge captured:', error)
  }
}

async function handleChargeExpired(charge: Stripe.Charge) {
  try {
    console.log(`Charge ${charge.id} expired`)
    // Handle expired charge logic
  } catch (error) {
    console.error('Error handling charge expired:', error)
  }
}

async function handleChargeFailed(charge: Stripe.Charge) {
  try {
    console.log(`Charge ${charge.id} failed: ${charge.failure_message}`)
    // Handle failed charge logic
  } catch (error) {
    console.error('Error handling charge failed:', error)
  }
}

async function handleChargePending(charge: Stripe.Charge) {
  try {
    console.log(`Charge ${charge.id} is pending`)
    // Handle pending charge logic
  } catch (error) {
    console.error('Error handling charge pending:', error)
  }
}

async function handleChargeSucceeded(charge: Stripe.Charge) {
  try {
    console.log(`Charge ${charge.id} succeeded for amount ${charge.amount}`)
    // Handle successful charge logic
  } catch (error) {
    console.error('Error handling charge succeeded:', error)
  }
}

async function handleChargeUpdated(charge: Stripe.Charge) {
  try {
    console.log(`Charge ${charge.id} updated`)
    // Handle charge update logic
  } catch (error) {
    console.error('Error handling charge updated:', error)
  }
}

// Dispute Event Handlers
async function handleChargeDisputeCreated(dispute: Stripe.Dispute) {
  try {
    console.log(`Dispute created for charge ${dispute.charge}: ${dispute.reason}`)
    // Handle dispute creation - notify admin, update charge status
  } catch (error) {
    console.error('Error handling dispute created:', error)
  }
}

async function handleChargeDisputeUpdated(dispute: Stripe.Dispute) {
  try {
    console.log(`Dispute updated for charge ${dispute.charge}: ${dispute.status}`)
    // Handle dispute update
  } catch (error) {
    console.error('Error handling dispute updated:', error)
  }
}

async function handleChargeDisputeClosed(dispute: Stripe.Dispute) {
  try {
    console.log(`Dispute closed for charge ${dispute.charge}: ${dispute.status}`)
    // Handle dispute closure
  } catch (error) {
    console.error('Error handling dispute closed:', error)
  }
}

// Customer Event Handlers
async function handleCustomerCreated(customer: Stripe.Customer) {
  try {
    console.log(`Customer created: ${customer.id}`)
    // Create customer record in database if needed
  } catch (error) {
    console.error('Error handling customer created:', error)
  }
}

async function handleCustomerUpdated(customer: Stripe.Customer) {
  try {
    console.log(`Customer updated: ${customer.id}`)
    // Update customer record in database
  } catch (error) {
    console.error('Error handling customer updated:', error)
  }
}

async function handleCustomerDeleted(customer: Stripe.Customer) {
  try {
    console.log(`Customer deleted: ${customer.id}`)
    // Handle customer deletion
  } catch (error) {
    console.error('Error handling customer deleted:', error)
  }
}

// Additional Subscription Event Handlers
async function handleSubscriptionTrialWillEnd(subscription: Stripe.Subscription) {
  try {
    console.log(`Subscription trial will end for customer ${subscription.customer}`)
    // Send notification to user about trial ending
  } catch (error) {
    console.error('Error handling subscription trial will end:', error)
  }
}

// Invoice Event Handlers
async function handleInvoiceCreated(invoice: Stripe.Invoice) {
  try {
    console.log(`Invoice created: ${invoice.id} for customer ${invoice.customer}`)
    // Handle invoice creation
  } catch (error) {
    console.error('Error handling invoice created:', error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log(`Invoice payment succeeded: ${invoice.id}`)
    // Handle successful invoice payment
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log(`Invoice payment failed: ${invoice.id}`)
    // Handle failed invoice payment
  } catch (error) {
    console.error('Error handling invoice payment failed:', error)
  }
}

async function handleInvoiceUpcoming(invoice: Stripe.Invoice) {
  try {
    console.log(`Invoice upcoming: ${invoice.id}`)
    // Send notification about upcoming invoice
  } catch (error) {
    console.error('Error handling invoice upcoming:', error)
  }
}

// Refund Event Handlers
async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    console.log(`Charge refunded: ${charge.id}`)
    // Handle charge refund
  } catch (error) {
    console.error('Error handling charge refunded:', error)
  }
}

async function handleRefundCreated(refund: Stripe.Refund) {
  try {
    console.log(`Refund created: ${refund.id} for charge ${refund.charge}`)
    // Handle refund creation
  } catch (error) {
    console.error('Error handling refund created:', error)
  }
}

async function handleRefundUpdated(refund: Stripe.Refund) {
  try {
    console.log(`Refund updated: ${refund.id}`)
    // Handle refund update
  } catch (error) {
    console.error('Error handling refund updated:', error)
  }
}

// Account Event Handlers
async function handleAccountUpdated(account: Stripe.Account) {
  try {
    console.log(`Account updated: ${account.id}`)
    // Handle account update
  } catch (error) {
    console.error('Error handling account updated:', error)
  }
}

// Setup Intent Event Handlers
async function handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent) {
  try {
    console.log(`Setup intent succeeded: ${setupIntent.id}`)
    // Handle successful setup intent
  } catch (error) {
    console.error('Error handling setup intent succeeded:', error)
  }
}

async function handleSetupIntentSetupFailed(setupIntent: Stripe.SetupIntent) {
  try {
    console.log(`Setup intent failed: ${setupIntent.id}`)
    // Handle failed setup intent
  } catch (error) {
    console.error('Error handling setup intent failed:', error)
  }
}
