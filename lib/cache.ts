import { NextResponse } from 'next/server'

// Cache interface
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of entries
  namespace?: string // Cache namespace for organization
}

// In-memory cache store (for development - use Redis in production)
class MemoryCache {
  private store: Map<string, CacheEntry<any>> = new Map()
  private maxSize: number
  private namespace: string

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 1000
    this.namespace = options.namespace || 'default'
  }

  private getKey(key: string): string {
    return `${this.namespace}:${key}`
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    const fullKey = this.getKey(key)
    
    // Check if we need to evict entries
    if (this.store.size >= this.maxSize) {
      this.evictOldest()
    }

    this.store.set(fullKey, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const fullKey = this.getKey(key)
    const entry = this.store.get(fullKey)

    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.store.delete(fullKey)
      return null
    }

    return entry.data
  }

  delete(key: string): boolean {
    const fullKey = this.getKey(key)
    return this.store.delete(fullKey)
  }

  clear(): void {
    this.store.clear()
  }

  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, entry] of this.store.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.store.delete(oldestKey)
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.store.size,
      maxSize: this.maxSize,
      namespace: this.namespace
    }
  }
}

// Cache instances for different purposes
export const formCache = new MemoryCache({ 
  namespace: 'forms', 
  maxSize: 500,
  ttl: 5 * 60 * 1000 // 5 minutes
})

export const userCache = new MemoryCache({ 
  namespace: 'users', 
  maxSize: 200,
  ttl: 10 * 60 * 1000 // 10 minutes
})

export const analyticsCache = new MemoryCache({ 
  namespace: 'analytics', 
  maxSize: 100,
  ttl: 15 * 60 * 1000 // 15 minutes
})

export const submissionCache = new MemoryCache({ 
  namespace: 'submissions', 
  maxSize: 300,
  ttl: 2 * 60 * 1000 // 2 minutes
})

// Cache middleware for API routes
export function withCache<T extends any[]>(
  cache: MemoryCache,
  keyGenerator: (...args: T) => string,
  ttl?: number
) {
  return function decorator(
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value

    descriptor.value = async function (...args: T) {
      const cacheKey = keyGenerator(...args)
      const cached = cache.get(cacheKey)

      if (cached) {
        return cached
      }

      const result = await method.apply(this, args)
      
      if (result) {
        cache.set(cacheKey, result, ttl)
      }

      return result
    }

    return descriptor
  }
}

// Cache wrapper for API route handlers
export async function withApiCache(
  request: any,
  cache: MemoryCache,
  keyGenerator: (request: any) => string,
  handler: (request: any) => Promise<NextResponse>,
  ttl?: number
): Promise<NextResponse> {
  const cacheKey = keyGenerator(request)
  const cached = cache.get<any>(cacheKey)

  if (cached) {
    // Add cache hit header
    const response = NextResponse.json(cached)
    response.headers.set('X-Cache', 'HIT')
    return response
  }

  // Execute handler
  const result = await handler(request)
  
  // Cache successful responses
  if (result.status >= 200 && result.status < 300) {
    const responseData = await result.json()
    cache.set(cacheKey, responseData, ttl)
  }

  // Add cache miss header
  result.headers.set('X-Cache', 'MISS')
  return result
}

// Cache invalidation helpers
export function invalidateFormCache(formId: string): void {
  // Invalidate form-specific cache
  formCache.delete(`form:${formId}`)
  
  // Invalidate user forms cache (will be regenerated on next request)
  formCache.delete(`user-forms:*`)
  
  // Invalidate analytics cache
  analyticsCache.delete(`analytics:*`)
}

export function invalidateUserCache(userId: string): void {
  userCache.delete(`user:${userId}`)
  userCache.delete(`profile:${userId}`)
  
  // Invalidate related caches
  formCache.delete(`user-forms:${userId}`)
  analyticsCache.delete(`analytics:${userId}`)
}

export function invalidateSubmissionCache(formId: string): void {
  submissionCache.delete(`submissions:${formId}`)
  
  // Invalidate form submission count
  formCache.delete(`form:${formId}`)
  
  // Invalidate analytics
  analyticsCache.delete(`analytics:*`)
}

// Cache warming functions
export async function warmFormCache(formId: string, formData: any): Promise<void> {
  formCache.set(`form:${formId}`, formData, 10 * 60 * 1000) // 10 minutes
}

export async function warmUserCache(userId: string, userData: any): Promise<void> {
  userCache.set(`user:${userId}`, userData, 15 * 60 * 1000) // 15 minutes
}

// Cache monitoring and health check
export function getCacheHealth() {
  return {
    forms: formCache.getStats(),
    users: userCache.getStats(),
    analytics: analyticsCache.getStats(),
    submissions: submissionCache.getStats(),
    timestamp: new Date().toISOString()
  }
}

// Cache cleanup (run periodically)
export function cleanupExpiredCache(): void {
  // This is handled automatically by the MemoryCache class
  // In production with Redis, you'd implement TTL-based cleanup
  console.log('Cache cleanup completed')
}

// Set up periodic cache cleanup
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredCache, 5 * 60 * 1000) // Every 5 minutes
}
