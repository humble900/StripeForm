/**
 * Hook for page caching and preloading
 */

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { pageCache } from '@/lib/page-cache'

export const usePageCache = () => {
  const router = useRouter()

  // Preload a page
  const preloadPage = useCallback(async (path: string, loader: () => Promise<any>) => {
    try {
      await pageCache.preloadPage(path, loader)
    } catch (error) {
      console.warn(`Failed to preload page ${path}:`, error)
    }
  }, [])

  // Enhanced navigation with caching
  const navigateTo = useCallback((path: string) => {
    // Check if page is cached
    const cached = pageCache.getRoute(path)
    if (cached) {
      // Page is cached, navigate immediately
      router.push(path)
    } else {
      // Page not cached, navigate and let it load
      router.push(path)
    }
  }, [router])

  // Preload common pages on mount
  useEffect(() => {
    const preloadCommonPages = async () => {
      try {
        // Preload dashboard
        await pageCache.preloadPage('dashboard', () => import('@/app/dashboard/page'))
        
        // Preload form builder
        await pageCache.preloadPage('builder', () => import('@/app/builder/page'))
        
        // Preload templates
        await pageCache.preloadPage('templates', () => import('@/app/templates/page'))
        
        // Preload admin
        await pageCache.preloadPage('admin', () => import('@/app/admin/page'))
      } catch (error) {
        console.warn('Failed to preload some pages:', error)
      }
    }

    preloadCommonPages()
  }, [])

  return {
    preloadPage,
    navigateTo,
    getCacheStats: () => pageCache.getStats(),
    clearCache: () => pageCache.clear()
  }
}


