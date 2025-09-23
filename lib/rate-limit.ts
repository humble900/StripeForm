import { NextRequest, NextResponse } from 'next/server'

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (request: NextRequest) => string
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store (for development - use Redis in production)
const store: RateLimitStore = {}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime <= now) {
      delete store[key]
    }
  })
}, 60000) // Clean up every minute

export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later.',
    keyGenerator = (request: NextRequest) => {
      const forwarded = request.headers.get('x-forwarded-for')
      const ip = forwarded ? forwarded.split(',')[0].trim() : 'anonymous'
      return ip
    }
  } = options

  return async (request: NextRequest): Promise<NextResponse | null> => {
    try {
      const key = keyGenerator(request)
      const now = Date.now()
      const resetTime = now + windowMs

      // Initialize or get existing record
      if (!store[key] || store[key].resetTime <= now) {
        store[key] = {
          count: 1,
          resetTime
        }
      } else {
        store[key].count++
      }

      const current = store[key]

      // Check if limit exceeded
      if (current.count > maxRequests) {
        const remaining = Math.ceil((current.resetTime - now) / 1000)
        
        return NextResponse.json({
          error: 'Rate limit exceeded',
          message,
          retryAfter: remaining,
          limit: maxRequests,
          remaining: 0,
          reset: new Date(current.resetTime).toISOString()
        }, { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': current.resetTime.toString(),
            'Retry-After': remaining.toString()
          }
        })
      }

      // Add rate limit headers to response (will be added by the calling function)
      return null // No rate limit exceeded
    } catch (error) {
      console.error('Rate limiting error:', error)
      // On error, allow the request to proceed
      return null
    }
  }
}

// Pre-configured rate limiters for different use cases
export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10 // 10 requests per 15 minutes
})

export const moderateRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100 // 100 requests per 15 minutes
})

export const lenientRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 1000 // 1000 requests per 15 minutes
})

// API-specific rate limiters
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.'
})

export const formSubmissionRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 form submissions per minute
  message: 'Too many form submissions, please slow down.'
})

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 500, // 500 API calls per 15 minutes
  message: 'API rate limit exceeded, please try again later.'
})

// More specific limiter for user forms dashboard fetches
export const userFormsRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 120, // 120 requests per minute per user/session/path
  message: 'Too many dashboard requests, please slow down.',
  keyGenerator: (request: NextRequest) => {
    // Prefer stable client identifiers over shared IP
    const fingerprint = request.headers.get('x-fingerprint')
    const auth = request.headers.get('authorization')
    const cookie = request.cookies.get('auth-token')?.value
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'anonymous'
    const path = request.nextUrl?.pathname || '/'

    const base = fingerprint || auth || cookie || ip
    return `${base}|${path}`
  }
})

export const stripeWebhookRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 webhook calls per minute
  keyGenerator: () => 'stripe-webhook' // Single key for all Stripe webhooks
})

// Helper function to add rate limit headers to response
export function addRateLimitHeaders(response: NextResponse, options: {
  limit: number
  remaining: number
  reset: number
}): NextResponse {
  response.headers.set('X-RateLimit-Limit', options.limit.toString())
  response.headers.set('X-RateLimit-Remaining', options.remaining.toString())
  response.headers.set('X-RateLimit-Reset', options.reset.toString())
  return response
}

// Wrapper function for applying rate limiting to API routes
export async function withRateLimit<T extends NextRequest>(
  request: T,
  rateLimiter: (request: NextRequest) => Promise<NextResponse | null>,
  handler: (request: T) => Promise<NextResponse>
): Promise<NextResponse> {
  const rateLimitResponse = await rateLimiter(request)
  
  if (rateLimitResponse) {
    return rateLimitResponse // Rate limit exceeded
  }
  
  return await handler(request)
}
