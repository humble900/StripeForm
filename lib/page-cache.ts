/**
 * In-memory page cache for instant navigation
 * Caches page components and data to prevent reloading
 */

interface CachedPage {
  component: React.ComponentType<any>
  data?: any
  timestamp: number
  ttl: number // Time to live in milliseconds
}

interface CachedRoute {
  path: string
  component: React.ComponentType<any>
  data?: any
  timestamp: number
  ttl: number
}

class PageCache {
  private cache = new Map<string, CachedPage>()
  private routeCache = new Map<string, CachedRoute>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Cache a page component with optional data
   */
  setPage(key: string, component: React.ComponentType<any>, data?: any, ttl?: number): void {
    this.cache.set(key, {
      component,
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    })
  }

  /**
   * Get a cached page component
   */
  getPage(key: string): CachedPage | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached
  }

  /**
   * Cache a route with component and data
   */
  setRoute(path: string, component: React.ComponentType<any>, data?: any, ttl?: number): void {
    this.routeCache.set(path, {
      path,
      component,
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    })
  }

  /**
   * Get a cached route
   */
  getRoute(path: string): CachedRoute | null {
    const cached = this.routeCache.get(path)
    if (!cached) return null

    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.routeCache.delete(path)
      return null
    }

    return cached
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now()

    // Clean page cache
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key)
      }
    }

    // Clean route cache
    for (const [path, cached] of this.routeCache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.routeCache.delete(path)
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
    this.routeCache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats(): { pages: number; routes: number; memory: number } {
    return {
      pages: this.cache.size,
      routes: this.routeCache.size,
      memory: this.cache.size + this.routeCache.size
    }
  }

  /**
   * Preload a page component
   */
  async preloadPage(key: string, loader: () => Promise<any>, ttl?: number): Promise<void> {
    try {
      const component = await loader()
      this.setPage(key, component, undefined, ttl)
    } catch (error) {
      console.warn(`Failed to preload page ${key}:`, error)
    }
  }

  /**
   * Preload multiple pages
   */
  async preloadPages(loaders: Array<{ key: string; loader: () => Promise<any>; ttl?: number }>): Promise<void> {
    const promises = loaders.map(({ key, loader, ttl }) => this.preloadPage(key, loader, ttl))
    await Promise.allSettled(promises)
  }
}

// Global page cache instance
export const pageCache = new PageCache()

// Cleanup expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    pageCache.cleanup()
  }, 5 * 60 * 1000)
}

// Export types
export type { CachedPage, CachedRoute }


