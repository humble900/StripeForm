import { NextRequest, NextResponse } from 'next/server'
import { getCacheHealth } from '@/lib/cache'
import { withRateLimit, apiRateLimit } from '@/lib/rate-limit'
import { withErrorHandling } from '@/lib/error-handler'

export async function GET(request: NextRequest) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      const cacheHealth = getCacheHealth()
      
      return NextResponse.json({
        success: true,
        data: cacheHealth,
        message: 'Cache health status retrieved successfully'
      })
    })
  )
}







