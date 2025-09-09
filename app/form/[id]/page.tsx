'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/ui/loading-spinner'

export default function FormRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params?.id as string

  useEffect(() => {
    if (formId) {
      // Redirect to the correct forms route
      router.replace(`/forms/${formId}`)
    }
  }, [formId, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Redirecting to form...</p>
      </div>
    </div>
  )
}
