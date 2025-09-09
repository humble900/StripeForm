import { NextRequest, NextResponse } from 'next/server'

// Custom error classes
export class AuthenticationError extends Error {
  statusCode: number = 401
  
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  statusCode: number = 403
  
  constructor(message: string) {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends Error {
  statusCode: number = 404
  
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ExternalServiceError extends Error {
  statusCode: number = 502
  
  constructor(service: string, message: string) {
    super(`${service} error: ${message}`)
    this.name = 'ExternalServiceError'
  }
}

export class ValidationError extends Error {
  statusCode: number = 400
  
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Error handling wrapper for API routes
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error: unknown) {
      console.error('API Error:', error)
      
      // Handle custom error types
      if (error instanceof AuthenticationError) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: error.statusCode }
        )
      }
      
      if (error instanceof AuthorizationError) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: error.statusCode }
        )
      }
      
      if (error instanceof NotFoundError) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: error.statusCode }
        )
      }
      
      if (error instanceof ValidationError) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: error.statusCode }
        )
      }
      
      if (error instanceof ExternalServiceError) {
        return NextResponse.json(
          { success: false, message: 'External service error' },
          { status: error.statusCode }
        )
      }
      
      // Handle generic errors
      const errorMessage = error instanceof Error ? error.message : 'Internal server error'
      
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: 500 }
      )
    }
  }
}

// Global error handling for client-side errors
export function setupGlobalErrorHandlers() {
  if (typeof window === 'undefined') return

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Production unhandled rejection:', {
        reason: event.reason?.toString(),
        stack: event.reason?.stack,
        userAgent: window.navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      })
    }
    
    // Prevent the default browser behavior
    event.preventDefault()
  })

  // Handle general JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global JavaScript error:', event.error)
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Production JavaScript error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.toString(),
        stack: event.error?.stack,
        userAgent: window.navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      })
    }
  })

  // Handle resource loading errors
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      console.error('Resource loading error:', {
        tagName: (event.target as any)?.tagName,
        src: (event.target as any)?.src,
        href: (event.target as any)?.href,
        userAgent: window.navigator.userAgent,
        url: window.location.href
      })
    }
  }, true)
}

// Mobile-specific error detection
export function detectMobileIssues() {
  if (typeof window === 'undefined') return

  const userAgent = window.navigator.userAgent.toLowerCase()
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
  
  if (isMobile) {
    // Check for common mobile issues
    const issues = []
    
    // Check for touch support
    if (!('ontouchstart' in window)) {
      issues.push('No touch support detected')
    }
    
    // Check for device pixel ratio
    if (window.devicePixelRatio && window.devicePixelRatio > 3) {
      issues.push('High DPI display detected')
    }
    
    // Check for canvas support
    const canvas = document.createElement('canvas')
    if (!canvas.getContext) {
      issues.push('Canvas not supported')
    }
    
    // Check for localStorage
    try {
      localStorage.setItem('test', 'test')
      localStorage.removeItem('test')
    } catch (e) {
      issues.push('localStorage not available')
    }
    
    if (issues.length > 0) {
      console.warn('Mobile compatibility issues detected:', issues)
    }
  }
}

// Initialize error handlers
export function initializeErrorHandling() {
  setupGlobalErrorHandlers()
  detectMobileIssues()
}