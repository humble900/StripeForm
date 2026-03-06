'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { pageCache } from '@/lib/page-cache'
import InlineLoading from '@/components/ui/inline-loading'

interface PageCacheContextType {
  isNavigating: boolean
  preloadPage: (path: string, loader: () => Promise<any>) => Promise<void>
  clearCache: () => void
  getCacheStats: () => { pages: number; routes: number; memory: number }
}

const PageCacheContext = createContext<PageCacheContextType | undefined>(undefined)

export const usePageCache = () => {
  const context = useContext(PageCacheContext)
  if (!context) {
    throw new Error('usePageCache must be used within a PageCacheProvider')
  }
  return context
}

interface PageCacheProviderProps {
  children: React.ReactNode
}

export const PageCacheProvider: React.FC<PageCacheProviderProps> = ({ children }) => {
  const [isNavigating, setIsNavigating] = useState(false)
  const [navigationPath, setNavigationPath] = useState<string | null>(null)
  const router = useRouter()

  // Preload common pages
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

  const preloadPage = async (path: string, loader: () => Promise<any>) => {
    try {
      await pageCache.preloadPage(path, loader)
    } catch (error) {
      console.warn(`Failed to preload page ${path}:`, error)
    }
  }

  const clearCache = () => {
    pageCache.clear()
  }

  const getCacheStats = () => {
    return pageCache.getStats()
  }

  // Enhanced navigation with loading state
  const enhancedPush = (path: string) => {
    setIsNavigating(true)
    setNavigationPath(path)

    // Check if page is cached
    const cached = pageCache.getRoute(path)
    if (cached) {
      // Page is cached, navigate immediately
      router.push(path)
      setTimeout(() => {
        setIsNavigating(false)
        setNavigationPath(null)
      }, 100) // Small delay for smooth transition
    } else {
      // Page not cached, navigate and let it load
      router.push(path)
      setTimeout(() => {
        setIsNavigating(false)
        setNavigationPath(null)
      }, 500) // Longer delay for uncached pages
    }
  }

  const contextValue: PageCacheContextType = {
    isNavigating,
    preloadPage,
    clearCache,
    getCacheStats
  }

  return (
    <PageCacheContext.Provider value={contextValue}>
      {children}

      {/* Inline loading indicator */}
      {isNavigating && (
        <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3">
          <InlineLoading
            size="sm"
            text={navigationPath ? `Loading ${navigationPath}...` : 'Loading...'}
            variant="dots"
          />
        </div>
      )}
    </PageCacheContext.Provider>
  )
}


