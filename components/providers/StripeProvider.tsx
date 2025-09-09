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
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <span className="ml-2">Initializing payment system...</span>
      </div>
    )
  }

  if (error || !stripePromise) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-red-600 font-medium">Payment system unavailable</p>
          <p className="text-gray-500 text-sm mt-1">{error || 'Stripe configuration error'}</p>
        </div>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  )
}
