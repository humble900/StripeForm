'use client'

import { ReactNode } from 'react'
import { useFormLimit } from '@/hooks/useFormLimit'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  LockClosedIcon, 
  StarIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline'

interface FormCreationGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export default function FormCreationGuard({ children, fallback }: FormCreationGuardProps) {
  const { canCreate, currentCount, limit, remaining, isUnlimited, isLoading } = useFormLimit()
  const router = useRouter()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  
  if (isUnlimited) {
    return <>{children}</>
  }
  
  if (!canCreate) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <Card className="border-red-200 bg-red-50 p-8 text-center">
        <LockClosedIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-red-900 mb-2">
          Form Limit Reached
        </h3>
        <p className="text-red-700 mb-6 max-w-md mx-auto">
          You've created {currentCount} forms as an anonymous user. 
          To continue creating forms, please sign in to your account.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => router.push('/login')}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <StarIcon className="h-4 w-4 mr-2" />
            Sign In to Continue
            <ArrowRightIcon className="h-4 w-4 ml-2" />
          </Button>
          
          <Button
            onClick={() => router.push('/pricing')}
            variant="outline"
            className="border-red-600 text-red-700 hover:bg-red-50"
          >
            View Plans
          </Button>
        </div>
        
        <div className="mt-6 p-4 bg-white rounded-lg border border-red-200 max-w-md mx-auto">
          <p className="text-sm text-red-600">
            <strong>Benefits of signing in:</strong> Unlimited forms, analytics, 
            response management, custom branding, and more!
          </p>
        </div>
      </Card>
    )
  }
  
  return <>{children}</>
}
