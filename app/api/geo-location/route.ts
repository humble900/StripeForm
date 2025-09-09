import { NextRequest, NextResponse } from 'next/server'
import { getClientIP, getServerGeoLocation } from '@/lib/geo-location'

export async function GET(request: NextRequest) {
  try {
    const clientIP = await getClientIP(request)
    const geoData = await getServerGeoLocation(clientIP)
    
    if (!geoData) {
      return NextResponse.json(
        { error: 'Unable to determine location' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      country: geoData.country,
      countryCode: geoData.countryCode,
      region: geoData.region,
      city: geoData.city,
      timezone: geoData.timezone,
    })
  } catch (error) {
    console.error('Error getting geolocation:', error)
    return NextResponse.json(
      { error: 'Failed to get location data' },
      { status: 500 }
    )
  }
}

