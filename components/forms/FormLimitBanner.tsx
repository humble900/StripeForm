'use client'

import { useFormLimit } from '@/hooks/useFormLimit'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  ExclamationTriangleIcon, 
  LockClosedIcon, 
  StarIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline'

export default function FormLimitBanner() {
  const { currentCount, limit, remaining, canCreate, isUnlimited, isLoading } = useFormLimit()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  
  if (isLoading || isUnlimited) return null
  
  const isAtLimit = remaining <= 0
  
  // Only show banner when user has published 5 forms (reached the limit)
  if (!isAtLimit) return null
  
  const handleSignIn = () => {
    router.push('/login')
  }
  
  const handleUpgrade = () => {
    router.push('/pricing')
  }
  
  return (
    <div className={`rounded-lg p-4 mb-6 ${
      isAtLimit 
        ? 'bg-red-50 border border-red-200' 
        : 'bg-amber-50 border border-amber-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isAtLimit ? (
            <LockClosedIcon className="h-6 w-6 text-red-600" />
          ) : (
            <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
          )}
          
          <div>
            <h3 className={`font-medium ${
              isAtLimit ? 'text-red-900' : 'text-amber-900'
            }`}>
              {isAtLimit ? 'Form Limit Reached' : 'Form Limit Warning'}
            </h3>
            <p className={`text-sm ${
              isAtLimit ? 'text-red-700' : 'text-amber-700'
            }`}>
              {isAtLimit 
                ? `You've published ${currentCount} forms. Upgrade to Pro for unlimited forms.`
                : `You can publish ${remaining} more forms. Upgrade to Pro for unlimited forms.`
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-right mr-3">
            <div className={`text-sm font-medium ${
              isAtLimit ? 'text-red-700' : 'text-amber-700'
            }`}>
              {currentCount} / {limit}
            </div>
            <div className={`text-xs ${
              isAtLimit ? 'text-red-600' : 'text-amber-600'
            }`}>
              {remaining > 0 ? `${remaining} remaining` : 'Limit reached'}
            </div>
          </div>
          
          <Button
            onClick={handleUpgrade}
            size="sm"
            className={`${
              isAtLimit 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            <StarIcon className="h-4 w-4 mr-1" />
            Upgrade to Pro
            <ArrowRightIcon className="h-4 w-4 ml-1" />
          </Button>
          
          {isAtLimit && (
            <Button
              onClick={handleUpgrade}
              size="sm"
              variant="outline"
              className="border-red-600 text-red-700 hover:bg-red-50"
            >
              View Plans
            </Button>
          )}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3">
        <div className={`w-full rounded-full h-2 ${
          isAtLimit ? 'bg-red-200' : 'bg-amber-200'
        }`}>
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              isAtLimit ? 'bg-red-600' : 'bg-amber-600'
            }`}
            style={{ width: `${(currentCount / limit) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
