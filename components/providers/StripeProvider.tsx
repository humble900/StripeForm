'use client'

import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import { ReactNode, useEffect, useState } from 'react'
import LoadingSpinner from '@/components/ui/loading-spinner'

interface StripeProviderProps {
  children: ReactNode
}

export function StripeProvider({ children }: StripeProviderProps) {
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Initialize Stripe with proper error handling
        const stripePromise = getStripe()
        if (stripePromise) {
          setStripePromise(stripePromise)
        } else {
          setError('Failed to initialize Stripe')
        }
      } catch (err) {
        console.error('Stripe initialization error:', err)
        setError('Stripe configuration error')
      } finally {
        setIsLoading(false)
      }
    }

    initializeStripe()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[200px]">
        <LoadingSpinner 
          size="md" 
          text="Initializing payment system..." 
        />
      </div>
    )
  }

  if (error || !stripePromise) {
    // Fallback: render children without Stripe so the builder still works
    if (process.env.NODE_ENV === 'development') {
      console.warn('Stripe unavailable, rendering builder without payment elements:', error)
    }
    return <>{children}</>
  }

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  )
}
