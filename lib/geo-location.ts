// IP-based geolocation detection
export interface GeoLocationData {
  country: string
  countryCode: string
  region: string
  city: string
  timezone: string
  ip: string
}

// Cache for geolocation data to avoid repeated API calls
const geoCache = new Map<string, GeoLocationData>()

export async function getGeoLocationData(): Promise<GeoLocationData | null> {
  try {
    // First try to get IP from client-side
    const response = await fetch('https://ipapi.co/json/')
    
    if (!response.ok) {
      throw new Error('Failed to fetch geolocation data')
    }

    const data = await response.json()
    
    const geoData: GeoLocationData = {
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'US',
      region: data.region || 'Unknown',
      city: data.city || 'Unknown',
      timezone: data.timezone || 'UTC',
      ip: data.ip || 'Unknown'
    }

    // Cache the result
    geoCache.set(geoData.ip, geoData)
    
    return geoData
  } catch (error) {
    console.error('Error fetching geolocation data:', error)
    
    // Fallback to US if geolocation fails
    return {
      country: 'United States',
      countryCode: 'US',
      region: 'Unknown',
      city: 'Unknown',
      timezone: 'UTC',
      ip: 'Unknown'
    }
  }
}

export async function getCountryFromIP(): Promise<string> {
  try {
    const geoData = await getGeoLocationData()
    return geoData?.countryCode || 'US'
  } catch (error) {
    console.error('Error getting country from IP:', error)
    return 'US' // Default fallback
  }
}

// Server-side IP detection (for API routes)
export async function getClientIP(request: Request): Promise<string> {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwarded) return forwarded.split(',')[0].trim()
  
  return 'Unknown'
}

// Server-side geolocation detection
export async function getServerGeoLocation(ip: string): Promise<GeoLocationData | null> {
  // Check cache first
  if (geoCache.has(ip)) {
    return geoCache.get(ip)!
  }

  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch geolocation data')
    }

    const data = await response.json()
    
    const geoData: GeoLocationData = {
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'US',
      region: data.region || 'Unknown',
      city: data.city || 'Unknown',
      timezone: data.timezone || 'UTC',
      ip: ip
    }

    // Cache the result
    geoCache.set(ip, geoData)
    
    return geoData
  } catch (error) {
    console.error('Error fetching server geolocation data:', error)
    return null
  }
}

