import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit, apiRateLimit } from '@/lib/rate-limit'
import { withErrorHandling } from '@/lib/error-handler'

// Simple in-memory cache for geolocation data
const geoCache = new Map<string, { data: any, timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET(request: NextRequest) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        // Get client IP from request headers
        const forwarded = request.headers.get('x-forwarded-for')
        const realIp = request.headers.get('x-real-ip')
        const clientIp = forwarded?.split(',')[0] || realIp || '127.0.0.1'

        // Check cache first
        const cached = geoCache.get(clientIp)
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          return NextResponse.json({
            success: true,
            data: cached.data,
            cached: true
          })
        }

        // Call ipapi.co from server-side to avoid CORS issues
        const response = await fetch(`https://ipapi.co/${clientIp}/json/`, {
          headers: {
            'User-Agent': 'StripeForm/1.0'
          },
          timeout: 5000 // 5 second timeout
        })

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`)
        }

        const data = await response.json()

        // Check if API returned an error
        if (data.error) {
          throw new Error(`API error: ${data.reason || 'Unknown error'}`)
        }

        const geoData = {
          country: data.country_name || 'Unknown',
          countryCode: data.country_code || 'US',
          region: data.region || 'Unknown',
          city: data.city || 'Unknown',
          timezone: data.timezone || 'UTC',
          ip: data.ip || clientIp
        }

        // Cache the result
        geoCache.set(clientIp, {
          data: geoData,
          timestamp: Date.now()
        })

        return NextResponse.json({
          success: true,
          data: geoData,
          cached: false
        })

      } catch (error) {
        console.error('Geolocation API error:', error)
        
        // Return fallback data
        const fallbackData = {
          country: 'United States',
          countryCode: 'US',
          region: 'Unknown',
          city: 'Unknown',
          timezone: 'UTC',
          ip: 'Unknown'
        }

        return NextResponse.json({
          success: true,
          data: fallbackData,
          cached: false,
          fallback: true
        })
      }
    })
  )
}