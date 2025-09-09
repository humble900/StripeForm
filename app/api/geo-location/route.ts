import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit, apiRateLimit } from '@/lib/rate-limit'
import { withErrorHandling } from '@/lib/error-handler'

export async function GET(request: NextRequest) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        // Get client IP from request headers
        const forwarded = request.headers.get('x-forwarded-for')
        const realIp = request.headers.get('x-real-ip')
        const clientIp = forwarded?.split(',')[0] || realIp || '127.0.0.1'

        // Call ipapi.co from server-side to avoid CORS issues
        const response = await fetch(`https://ipapi.co/${clientIp}/json/`, {
          headers: {
            'User-Agent': 'StripeForm/1.0'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch geolocation data')
        }

        const data = await response.json()

        const geoData = {
          country: data.country_name || 'Unknown',
          countryCode: data.country_code || 'US',
          region: data.region || 'Unknown',
          city: data.city || 'Unknown',
          timezone: data.timezone || 'UTC',
          ip: data.ip || clientIp
        }

        return NextResponse.json({
          success: true,
          data: geoData
        })

      } catch (error) {
        console.error('Geolocation API error:', error)
        
        // Return fallback data
        return NextResponse.json({
          success: true,
          data: {
            country: 'United States',
            countryCode: 'US',
            region: 'Unknown',
            city: 'Unknown',
            timezone: 'UTC',
            ip: 'Unknown'
          }
        })
      }
    })
  )
}