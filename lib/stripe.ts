import { loadStripe, Stripe as StripeType } from '@stripe/stripe-js'

// Server-side Stripe instance (for API routes) - only import on server
let stripe: any = null
if (typeof window === 'undefined') {
  // Server-side only
  const Stripe = require('stripe').default
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-07-30.basil',
  })
}
export { stripe }

// Client-side configuration
export const stripeConfig = {
  PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  PRO_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
  PRO_YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
}

// Debug logging in development
if (process.env.NODE_ENV === 'development') {
  console.log('Stripe Config:', {
    PUBLISHABLE_KEY: stripeConfig.PUBLISHABLE_KEY ? 'Set' : 'Missing',
    PRO_MONTHLY: stripeConfig.PRO_MONTHLY ? 'Set' : 'Missing',
    PRO_YEARLY: stripeConfig.PRO_YEARLY ? 'Set' : 'Missing',
  })
}

// Validate required environment variables (only in production)
if (process.env.NODE_ENV === 'production' && !stripeConfig.PUBLISHABLE_KEY) {
  throw new Error('Missing required Stripe environment variables. Please check your .env.local file.')
}

// Modern Stripe client initialization using loadStripe
let stripePromise: Promise<StripeType | null>

export const getStripe = () => {
  if (!stripePromise) {
    if (!stripeConfig.PUBLISHABLE_KEY) {
      console.warn('Stripe publishable key not found. Stripe functionality will be disabled.')
      return Promise.resolve(null)
    }
    stripePromise = loadStripe(stripeConfig.PUBLISHABLE_KEY)
  }
  return stripePromise
}

// Payment intent creation
export const createPaymentIntent = async (amount: number, currency: string = 'usd') => {
  const response = await fetch('/api/stripe/create-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to create payment intent')
  }

  return response.json()
}

// Subscription creation
export const createSubscription = async (priceId: string, customerId?: string) => {
  const response = await fetch('/api/stripe/create-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      priceId,
      customerId,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to create subscription')
  }

  return response.json()
}

// Customer creation
export const createCustomer = async (email: string, name?: string) => {
  const response = await fetch('/api/stripe/create-customer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      name,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to create customer')
  }

  return response.json()
}

// Subscription management
export const cancelSubscription = async (subscriptionId: string) => {
  const response = await fetch('/api/stripe/cancel-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subscriptionId,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to cancel subscription')
  }

  return response.json()
}

export const updateSubscription = async (subscriptionId: string, priceId: string) => {
  const response = await fetch('/api/stripe/update-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subscriptionId,
      priceId,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to update subscription')
  }

  return response.json()
}

// Payment form field helpers
export const formatAmountForDisplay = (amount: number, currency: string = 'usd') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100)
}

// Stripe configuration constants
export const STRIPE_CONFIG = {
  PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  PRICE_IDS: {
    PRO_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    PRO_YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
  },
  CURRENCIES: ['usd', 'eur', 'gbp', 'cad', 'aud'] as const,
  PAYMENT_METHODS: ['card', 'sepa_debit', 'sofort'] as const,
} 