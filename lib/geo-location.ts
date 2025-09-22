/**
 * Geo-Location and IP Restriction Utilities
 * 
 * 🌍 Provides IP geolocation detection and country-based restrictions
 * 🛡️ Supports geo-political compliance and access control
 * 📊 Integrates with IP geolocation services
 */

export interface GeoLocationData {
  country: string
  countryCode: string
  region: string
  city: string
  timezone: string
  isp: string
  ip: string
}

export interface GeoRestrictions {
  enabled: boolean
  allowedCountries: string[]
  blockedCountries: string[]
  allowedRegions: string[]
  blockedRegions: string[]
  allowedIPs: string[]
  blockedIPs: string[]
  mode: 'allowlist' | 'blocklist' // allowlist = only allow specified, blocklist = block specified
}

export interface RestrictionResult {
  isAllowed: boolean
  reason?: string
  detectedLocation?: GeoLocationData
}

/**
 * Get client IP address from request headers
 */
export function getClientIP(request: Request): string {
  // Check various headers for IP address
  const headers = request.headers
  
  // Check X-Forwarded-For header (most common for proxies)
  const xForwardedFor = headers.get('x-forwarded-for')
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }
  
  // Check X-Real-IP header
  const xRealIP = headers.get('x-real-ip')
  if (xRealIP) {
    return xRealIP
  }
  
  // Check CF-Connecting-IP (Cloudflare)
  const cfConnectingIP = headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // Check X-Client-IP
  const xClientIP = headers.get('x-client-ip')
  if (xClientIP) {
    return xClientIP
  }
  
  // Fallback to localhost for development
  return '127.0.0.1'
}

/**
 * Get geolocation data for an IP address
 * Uses a free IP geolocation service
 */
export async function getIPGeolocation(ip: string): Promise<GeoLocationData | null> {
  try {
    // Skip geolocation for localhost/private IPs
    if (isPrivateIP(ip)) {
      return {
        country: 'Unknown',
        countryCode: 'XX',
        region: 'Unknown',
        city: 'Unknown',
        timezone: 'UTC',
        isp: 'Unknown',
        ip: ip
      }
    }
    
    // Use ipapi.co free service (1000 requests/day)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': 'FormBuilder/1.0'
      }
    })
    
    if (!response.ok) {
      console.warn(`Failed to get geolocation for IP ${ip}: ${response.status}`)
      return null
    }
    
    const data = await response.json()
    
    return {
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'XX',
      region: data.region || 'Unknown',
      city: data.city || 'Unknown',
      timezone: data.timezone || 'UTC',
      isp: data.org || 'Unknown',
      ip: ip
    }
  } catch (error) {
    console.warn(`Error getting geolocation for IP ${ip}:`, error)
    return null
  }
}

/**
 * Check if IP is private/local
 */
function isPrivateIP(ip: string): boolean {
  const privateRanges = [
    /^127\./, // 127.0.0.0/8 (localhost)
    /^10\./, // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./, // 192.168.0.0/16
    /^::1$/, // IPv6 localhost
    /^fc00:/, // IPv6 private
    /^fe80:/, // IPv6 link-local
  ]
  
  return privateRanges.some(range => range.test(ip))
}

/**
 * Check if access is allowed based on geo-restrictions
 */
export async function checkGeoRestrictions(
  request: Request,
  restrictions: GeoRestrictions
): Promise<RestrictionResult> {
  // If restrictions are disabled, allow access
  if (!restrictions.enabled) {
    return { isAllowed: true }
  }
  
  const clientIP = getClientIP(request)
  const geoData = await getIPGeolocation(clientIP)
  
  if (!geoData) {
    // If we can't determine location, allow access (fail open)
    return { 
      isAllowed: true,
      reason: 'Unable to determine location'
    }
  }
  
  // Check IP-based restrictions first
  if (restrictions.blockedIPs.includes(clientIP)) {
    return {
      isAllowed: false,
      reason: 'IP address is blocked',
      detectedLocation: geoData
    }
  }
  
  if (restrictions.allowedIPs.length > 0 && !restrictions.allowedIPs.includes(clientIP)) {
    return {
      isAllowed: false,
      reason: 'IP address not in allowed list',
      detectedLocation: geoData
    }
  }
  
  // Check country-based restrictions
  if (restrictions.mode === 'blocklist') {
    // Block specified countries
    if (restrictions.blockedCountries.includes(geoData.countryCode)) {
      return {
        isAllowed: false,
        reason: `Access blocked from ${geoData.country}`,
        detectedLocation: geoData
      }
    }
    
    if (restrictions.blockedRegions.length > 0 && restrictions.blockedRegions.includes(geoData.region)) {
      return {
        isAllowed: false,
        reason: `Access blocked from region ${geoData.region}`,
        detectedLocation: geoData
      }
    }
  } else {
    // Allowlist mode - only allow specified countries
    if (restrictions.allowedCountries.length > 0 && !restrictions.allowedCountries.includes(geoData.countryCode)) {
      return {
        isAllowed: false,
        reason: `Access only allowed from specific countries`,
        detectedLocation: geoData
      }
    }
    
    if (restrictions.allowedRegions.length > 0 && !restrictions.allowedRegions.includes(geoData.region)) {
      return {
        isAllowed: false,
        reason: `Access only allowed from specific regions`,
        detectedLocation: geoData
      }
    }
  }
  
  return {
    isAllowed: true,
    detectedLocation: geoData
  }
}

/**
 * Get default geo-restrictions settings
 */
export function getDefaultGeoRestrictions(): GeoRestrictions {
  return {
    enabled: false,
    allowedCountries: [],
    blockedCountries: [],
    allowedRegions: [],
    blockedRegions: [],
    allowedIPs: [],
    blockedIPs: [],
    mode: 'blocklist'
  }
}

/**
 * Validate geo-restrictions settings
 */
export function validateGeoRestrictions(restrictions: any): GeoRestrictions {
  const defaultRestrictions = getDefaultGeoRestrictions()
  
  return {
    enabled: Boolean(restrictions?.enabled),
    allowedCountries: Array.isArray(restrictions?.allowedCountries) ? restrictions.allowedCountries : [],
    blockedCountries: Array.isArray(restrictions?.blockedCountries) ? restrictions.blockedCountries : [],
    allowedRegions: Array.isArray(restrictions?.allowedRegions) ? restrictions.allowedRegions : [],
    blockedRegions: Array.isArray(restrictions?.blockedRegions) ? restrictions.blockedRegions : [],
    allowedIPs: Array.isArray(restrictions?.allowedIPs) ? restrictions.allowedIPs : [],
    blockedIPs: Array.isArray(restrictions?.blockedIPs) ? restrictions.blockedIPs : [],
    mode: restrictions?.mode === 'allowlist' ? 'allowlist' : 'blocklist'
  }
}