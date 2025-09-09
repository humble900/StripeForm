import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'

interface UseAuthRedirectOptions {
  redirectTo?: string
  requireAuth?: boolean
  redirectIfAuthenticated?: boolean
}

export function useAuthRedirect({
  redirectTo = '/login',
  requireAuth = true,
  redirectIfAuthenticated = false
}: UseAuthRedirectOptions = {}) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo)
    }

    if (redirectIfAuthenticated && isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectIfAuthenticated, redirectTo, router])

  return {
    user,
    isLoading,
    isAuthenticated,
    shouldRender: requireAuth ? isAuthenticated : true
  }
}

// Hook for pages that require authentication
export function useRequireAuth(redirectTo?: string) {
  return useAuthRedirect({ requireAuth: true, redirectTo })
}

// Hook for pages that should redirect authenticated users (like login/register)
export function useRedirectIfAuthenticated(redirectTo: string = '/dashboard') {
  return useAuthRedirect({ redirectIfAuthenticated: true, redirectTo })
}
