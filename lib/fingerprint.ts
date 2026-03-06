import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { DeviceFingerprint, FingerprintComponents } from '@/types'

let fpPromise: Promise<any>

const FINGERPRINT_COOKIE = 'sf_fp'

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

const setCookie = (name: string, value: string, days = 365) => {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; Expires=${expires}; Path=/; SameSite=Lax`
}

const getFingerprint = async (): Promise<DeviceFingerprint> => {
  if (!fpPromise) {
    fpPromise = FingerprintJS.load()
  }

  const fp = await fpPromise
  const result = await fp.get()

  const components: FingerprintComponents = {
    user_agent: navigator.userAgent,
    screen_resolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    canvas_fingerprint: result.components.canvas?.value || '',
    webgl_fingerprint: result.components.webgl?.value || '',
    installed_fonts: result.components.fonts?.value || [],
    plugins: Array.from(navigator.plugins).map(p => p.name),
  }

  return {
    fingerprint: result.visitorId,
    components,
    confidence: result.confidence?.score || 0,
  }
}

// Get device info for analytics
export const getDeviceInfo = () => {
  return {
    screen_size: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    user_agent: navigator.userAgent,
  }
}

// Generate a simple fingerprint for fallback
export const generateSimpleFingerprint = (): string => {
  const components = [
    navigator.userAgent,
    screen.width,
    screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    navigator.platform,
    new Date().getTimezoneOffset(),
  ]

  // Simple hash function
  const hash = components.join('|').split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)

  return Math.abs(hash).toString(36)
}

// Get fingerprint with fallback
export const getDeviceFingerprint = async (): Promise<string> => {
  try {
    // 1) Prefer existing persisted ID (cookie, then localStorage)
    const cookieFp = getCookie(FINGERPRINT_COOKIE)
    if (cookieFp) return cookieFp

    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(FINGERPRINT_COOKIE)
      if (stored) {
        setCookie(FINGERPRINT_COOKIE, stored)
        return stored
      }
    }

    // 2) Generate new via FPJS
    const fingerprint = await getFingerprint()
    const id = fingerprint.fingerprint
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(FINGERPRINT_COOKIE, id)
    }
    setCookie(FINGERPRINT_COOKIE, id)
    return id
  } catch (error) {
    console.warn('FingerprintJS failed, using fallback:', error)
    const id = generateSimpleFingerprint()
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(FINGERPRINT_COOKIE, id)
    }
    setCookie(FINGERPRINT_COOKIE, id)
    return id
  }
}

// Get IP address (requires external service)
export const getIPAddress = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch (error) {
    console.warn('Failed to get IP address:', error)
    return 'unknown'
  }
}

// Create anonymous user data
export const createAnonymousUserData = async () => {
  const [fingerprint, ip] = await Promise.all([
    getDeviceFingerprint(),
    getIPAddress(),
  ])

  return {
    fingerprint,
    ip_address: ip,
    user_agent: navigator.userAgent,
    form_count: 0,
    created_at: new Date().toISOString(),
    last_seen: new Date().toISOString(),
  }
}

// Check if user is returning (same device)
export const isReturningUser = (storedFingerprint: string): Promise<boolean> => {
  return getDeviceFingerprint().then(currentFingerprint => {
    return storedFingerprint === currentFingerprint
  })
}

// Get browser capabilities for enhanced fingerprinting
export const getBrowserCapabilities = () => {
  const capabilities = {
    cookies: navigator.cookieEnabled,
    localStorage: typeof Storage !== 'undefined',
    sessionStorage: typeof sessionStorage !== 'undefined',
    geolocation: 'geolocation' in navigator,
    notifications: 'Notification' in window,
    serviceWorker: 'serviceWorker' in navigator,
    webGL: (() => {
      try {
        const canvas = document.createElement('canvas')
        return !!(window.WebGLRenderingContext && canvas.getContext('webgl'))
      } catch (e) {
        return false
      }
    })(),
    canvas: (() => {
      try {
        const canvas = document.createElement('canvas')
        return !!canvas.getContext
      } catch (e) {
        return false
      }
    })(),
  }

  return capabilities
}

// Enhanced fingerprint with browser capabilities
export const getEnhancedFingerprint = async (): Promise<DeviceFingerprint> => {
  const basicFingerprint = await getFingerprint()
  const capabilities = getBrowserCapabilities()

  return {
    ...basicFingerprint,
    components: {
      ...basicFingerprint.components,
      capabilities,
    },
  }
} 