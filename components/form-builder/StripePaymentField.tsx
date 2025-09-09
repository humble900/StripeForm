'use client'

import React from 'react'
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CreditCard, Lock } from 'lucide-react'

interface StripePaymentFieldProps {
  field: any
  value?: any
  onChange?: (value: any) => void
  error?: string
  isPreview?: boolean
  showLabel?: boolean
}

export function StripePaymentField({ 
  field, 
  value, 
  onChange, 
  error, 
  isPreview = false,
  showLabel = true 
}: StripePaymentFieldProps) {
  const stripe = useStripe()
  const elements = useElements()

  const handlePaymentChange = (event: any) => {
    if (onChange) {
      onChange({
        complete: event.complete,
        error: event.error,
        type: event.type
      })
    }
  }

  if (isPreview) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="text-center">
          <div className="text-blue-600 mb-2">💳</div>
          <p className="text-sm text-gray-600">Payment field preview</p>
          <p className="text-xs text-gray-500 mt-1">Configure Stripe in form settings</p>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="w-5 h-5 text-blue-600" />
          {showLabel && (field.label || 'Payment Information')}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Secure payment powered by Stripe
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Number
            </label>
            <div className="border rounded-md p-3 bg-white">
              <CardNumberElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
                onChange={handlePaymentChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <div className="border rounded-md p-3 bg-white">
                <CardExpiryElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                      invalid: {
                        color: '#9e2146',
                      },
                    },
                  }}
                  onChange={handlePaymentChange}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVC
              </label>
              <div className="border rounded-md p-3 bg-white">
                <CardCvcElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                      invalid: {
                        color: '#9e2146',
                      },
                    },
                  }}
                  onChange={handlePaymentChange}
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600">{error}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Lock className="w-3 h-3" />
          <span>Your payment information is secure and encrypted</span>
        </div>
      </CardContent>
    </Card>
  )
}
