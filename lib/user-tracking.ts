/**
 * Advanced User Tracking System
 * 
 * 🕵️ Tracks user visits with multiple identification methods
 * 🛡️ Prevents abuse through VPN detection and cookie clearing
 * 📊 Provides comprehensive analytics for legitimate users
 * 🔒 Maintains user privacy while preventing system abuse
 */

import { getDeviceFingerprint } from './fingerprint'

export interface UserTrackingData {
  fingerprint: string
  ip: string
  userAgent: string
  cookies: string[]
  sessionId: string
  timestamp: Date
  geoData?: {
    country: string
    city: string
    region: string
    timezone: string
    isp: string
  }
}

export interface AbuseDetectionResult {
  isSuspicious: boolean
  riskScore: number
  reasons: string[]
  recommendations: string[]
}

class UserTrackingManager {
  private static instance: UserTrackingManager
  private currentSession: string
  private visitHistory: Map<string, number> = new Map()
  private ipHistory: Map<string, number> = new Map()

  private constructor() {
    this.currentSession = this.generateSessionId()
  }

  static getInstance(): UserTrackingManager {
    if (!UserTrackingManager.instance) {
      UserTrackingManager.instance = new UserTrackingManager()
    }
    return UserTrackingManager.instance
  }

  /**
   * Track a user visit with comprehensive data collection
   */
  async trackUserVisit(): Promise<UserTrackingData> {
    try {
      // Get device fingerprint
      const fingerprint = await getDeviceFingerprint()
      
      // Get IP address
      const ip = await this.getIPAddress()
      
      // Get user agent
      const userAgent = navigator.userAgent
      
      // Get cookies
      const cookies = this.getCookies()
      
      // Generate session ID
      const sessionId = this.currentSession
      
      // Get geolocation data
      const geoData = await this.getGeoData(ip)
      
      // Update visit history
      this.updateVisitHistory(fingerprint, ip)
      
      // Store tracking data
      const trackingData: UserTrackingData = {
        fingerprint,
        ip,
        userAgent,
        cookies,
        sessionId,
        timestamp: new Date(),
        geoData
      }
      
      // Log tracking (admin only)
      console.group('🕵️ User Visit Tracked (Admin Only)')
      console.log('Fingerprint:', fingerprint)
      console.log('IP Address:', ip)
      console.log('Session ID:', sessionId)
      console.log('Visit Count:', this.visitHistory.get(fingerprint) || 1)
      console.log('IP History:', this.ipHistory.get(ip) || 1)
      console.log('Geolocation:', geoData)
      console.groupEnd()
      
      return trackingData
      
    } catch (error) {
      console.warn('⚠️ Could not track user visit (non-critical):', error)
      
      // Return basic tracking data even if some methods fail
      return {
        fingerprint: 'unknown',
        ip: 'unknown',
        userAgent: navigator.userAgent || 'unknown',
        cookies: this.getCookies(),
        sessionId: this.currentSession,
        timestamp: new Date()
      }
    }
  }

  /**
   * Detect potential abuse patterns
   */
  detectAbuse(trackingData: UserTrackingData): AbuseDetectionResult {
    const reasons: string[] = []
    const recommendations: string[] = []
    let riskScore = 0

    // Check for rapid IP changes (VPN detection)
    const ipVisitCount = this.ipHistory.get(trackingData.ip) || 0
    if (ipVisitCount > 10) {
      riskScore += 30
      reasons.push('High IP visit count - possible VPN abuse')
      recommendations.push('Implement rate limiting per IP')
    }

    // Check for rapid fingerprint changes
    const fingerprintVisitCount = this.visitHistory.get(trackingData.fingerprint) || 0
    if (fingerprintVisitCount > 20) {
      riskScore += 25
      reasons.push('High fingerprint visit count - possible abuse')
      recommendations.push('Implement fingerprint-based rate limiting')
    }

    // Check for missing cookies (cookie clearing detection)
    if (trackingData.cookies.length < 3) {
      riskScore += 15
      reasons.push('Low cookie count - possible cookie clearing')
      recommendations.push('Implement cookie validation')
    }

    // Check for suspicious user agents
    if (this.isSuspiciousUserAgent(trackingData.userAgent)) {
      riskScore += 20
      reasons.push('Suspicious user agent detected')
      recommendations.push('Implement user agent validation')
    }

    // Check for rapid session changes
    if (this.detectRapidSessionChanges(trackingData.fingerprint)) {
      riskScore += 25
      reasons.push('Rapid session changes detected')
      recommendations.push('Implement session rate limiting')
    }

    const isSuspicious = riskScore > 50

    return {
      isSuspicious,
      riskScore,
      reasons,
      recommendations
    }
  }

  /**
   * Get IP address using our server-side API
   */
  private async getIPAddress(): Promise<string> {
    try {
      // Use our server-side API to avoid CORS issues
      const response = await fetch('/api/geo-location')
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data.ip) {
          return result.data.ip
        }
      }
    } catch (error) {
      console.warn('IP detection failed:', error)
    }

    // Final fallback: return localhost for development
    return '127.0.0.1'
  }

  /**
   * Get geolocation data for IP address
   */
  private async getGeoData(ip: string): Promise<UserTrackingData['geoData']> {
    try {
      // Use our server-side API to avoid CORS issues
      const response = await fetch('/api/geo-location')
      
      if (response.ok) {
        const result = await response.json()
        
        if (result.success) {
          const data = result.data
          return {
            country: data.country || 'Unknown',
            city: data.city || 'Unknown',
            region: data.region || 'Unknown',
            timezone: data.timezone || 'Unknown',
            isp: 'Unknown'
          }
        }
      }
    } catch (error) {
      console.warn('Could not get geolocation data:', error)
    }
    
    return undefined
  }

  /**
   * Get all cookies
   */
  private getCookies(): string[] {
    return document.cookie.split(';').map(cookie => cookie.trim())
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Update visit history for abuse detection
   */
  private updateVisitHistory(fingerprint: string, ip: string): void {
    const currentFingerprintCount = this.visitHistory.get(fingerprint) || 0
    const currentIpCount = this.ipHistory.get(ip) || 0
    
    this.visitHistory.set(fingerprint, currentFingerprintCount + 1)
    this.ipHistory.set(ip, currentIpCount + 1)
    
    // Clean up old entries to prevent memory leaks
    if (this.visitHistory.size > 1000) {
      const entries = Array.from(this.visitHistory.entries())
      entries.sort((a, b) => b[1] - a[1])
      this.visitHistory = new Map(entries.slice(0, 500))
    }
    
    if (this.ipHistory.size > 1000) {
      const entries = Array.from(this.ipHistory.entries())
      entries.sort((a, b) => b[1] - a[1])
      this.ipHistory = new Map(entries.slice(0, 500))
    }
  }

  /**
   * Check if user agent is suspicious
   */
  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /headless/i,
      /phantom/i,
      /selenium/i,
      /puppeteer/i,
      /playwright/i
    ]
    
    return suspiciousPatterns.some(pattern => pattern.test(userAgent))
  }

  /**
   * Detect rapid session changes
   */
  private detectRapidSessionChanges(fingerprint: string): boolean {
    // This would typically check against a database
    // For now, we'll use a simple in-memory check
    const visitCount = this.visitHistory.get(fingerprint) || 0
    return visitCount > 50 // More than 50 visits in a session
  }

  /**
   * Get tracking summary for admin dashboard
   */
  getTrackingSummary() {
    return {
      totalUniqueUsers: this.visitHistory.size,
      totalUniqueIPs: this.ipHistory.size,
      currentSession: this.currentSession,
      topFingerprints: Array.from(this.visitHistory.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      topIPs: Array.from(this.ipHistory.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
    }
  }

  /**
   * Reset tracking data (for testing purposes)
   */
  resetTracking(): void {
    this.visitHistory.clear()
    this.ipHistory.clear()
    this.currentSession = this.generateSessionId()
  }
}

// Export singleton instance
export const userTracking = UserTrackingManager.getInstance()

// Export types (already exported above)
