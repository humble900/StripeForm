import Stripe from 'stripe'
import { env } from './env'

// Server-side Stripe instance (for API routes only)
export const stripe = new Stripe(env.stripe.secretKey, {
  apiVersion: '2025-08-27.basil',
})

// Server-side helper functions
export const createPaymentIntent = async (amount: number, currency: string = 'usd') => {
  return await stripe.paymentIntents.create({
    amount,
    currency,
  })
}

export const createSubscription = async (priceId: string, customerId?: string) => {
  if (!customerId) {
    throw new Error('Customer ID is required to create a subscription')
  }
  
  return await stripe.subscriptions.create({
    items: [{ price: priceId }],
    customer: customerId,
  })
}

export const createCustomer = async (email: string, name?: string) => {
  return await stripe.customers.create({
    email,
    name,
  })
}

export const cancelSubscription = async (subscriptionId: string) => {
  return await stripe.subscriptions.cancel(subscriptionId)
}

export const updateSubscription = async (subscriptionId: string, priceId: string) => {
  return await stripe.subscriptions.update(subscriptionId, {
    items: [{ price: priceId }],
  })
}
