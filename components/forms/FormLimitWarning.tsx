'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  ExclamationTriangleIcon, 
  LockClosedIcon, 
  StarIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline'

interface FormLimitWarningProps {
  currentCount: number
  limit: number
  onClose?: () => void
}

export default function FormLimitWarning({ currentCount, limit, onClose }: FormLimitWarningProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isVisible, setIsVisible] = useState(true)
  
  const remaining = limit - currentCount
  const isAtLimit = remaining <= 0
  const isNearLimit = remaining <= 2
  
  if (!isVisible) return null
  
  const handleSignIn = () => {
    router.push('/login')
    onClose?.()
  }
  
  const handleUpgrade = () => {
    router.push('/pricing')
    onClose?.()
  }
  
  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }
  
  if (isAuthenticated) return null
  
  return (
    <Card className="border-amber-200 bg-amber-50 p-6 mb-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {isAtLimit ? (
            <LockClosedIcon className="h-8 w-8 text-amber-600" />
          ) : (
            <ExclamationTriangleIcon className="h-8 w-8 text-amber-600" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-amber-900">
              {isAtLimit ? 'Form Limit Reached!' : 'Form Limit Warning'}
            </h3>
            <button
              onClick={handleClose}
              className="text-amber-600 hover:text-amber-800"
            >
              ×
            </button>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-800">
                Forms created: {currentCount} / {limit}
              </span>
              <span className="text-sm text-amber-600">
                {remaining > 0 ? `${remaining} remaining` : 'Limit reached'}
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-amber-200 rounded-full h-2">
              <div 
                className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentCount / limit) * 100}%` }}
              />
            </div>
          </div>
          
          {isAtLimit ? (
            <div className="space-y-3">
              <p className="text-amber-800">
                You've reached the limit of {limit} forms for anonymous users. 
                To continue creating forms, please sign in or upgrade your account.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleSignIn}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <StarIcon className="h-4 w-4 mr-2" />
                  Sign In to Continue
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Button>
                
                <Button
                  onClick={handleUpgrade}
                  variant="outline"
                  className="border-amber-600 text-amber-700 hover:bg-amber-50"
                >
                  View Plans
                </Button>
              </div>
            </div>
          ) : isNearLimit ? (
            <div className="space-y-3">
              <p className="text-amber-800">
                You're approaching the limit of {limit} forms for anonymous users. 
                Consider signing in to unlock unlimited forms and additional features.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleSignIn}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <StarIcon className="h-4 w-4 mr-2" />
                  Sign In Now
                </Button>
                
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="border-amber-600 text-amber-700 hover:bg-amber-50"
                >
                  Continue Anonymously
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-amber-800">
                You can create {remaining} more forms anonymously. 
                Sign in to unlock unlimited forms and premium features.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleSignIn}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <StarIcon className="h-4 w-4 mr-2" />
                  Sign In for Unlimited Forms
                </Button>
                
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="border-amber-600 text-amber-700 hover:bg-amber-50"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-white rounded-lg border border-amber-200">
            <p className="text-sm text-amber-700">
              <strong>Benefits of signing in:</strong> Unlimited forms, form analytics, 
              response management, custom branding, and more!
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
