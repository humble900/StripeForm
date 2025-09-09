import { NextResponse } from 'next/server'
import { z } from 'zod'

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly code?: string
  public readonly details?: any

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string,
    details?: any
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.code = code
    this.details = details

    Error.captureStackTrace(this, this.constructor)
  }
}

// Predefined error classes
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, true, 'VALIDATION_ERROR', details)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, true, 'AUTHENTICATION_ERROR')
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, true, 'AUTHORIZATION_ERROR')
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, true, 'NOT_FOUND_ERROR')
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true, 'CONFLICT_ERROR')
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, true, 'RATE_LIMIT_ERROR')
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(
      message || `External service error: ${service}`,
      502,
      true,
      'EXTERNAL_SERVICE_ERROR',
      { service }
    )
  }
}

// Error response interface
interface ErrorResponse {
  error: string
  message: string
  code?: string
  details?: any
  timestamp: string
  requestId?: string
}

// Error handler function
export function handleError(error: unknown, requestId?: string): NextResponse {
  console.error('API Error:', error)

  // Handle AppError instances
  if (error instanceof AppError) {
    const response: ErrorResponse = {
      error: error.constructor.name,
      message: error.message,
      code: error.code,
      details: error.details,
      timestamp: new Date().toISOString(),
      requestId
    }

    return NextResponse.json(response, { status: error.statusCode })
  }

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    const response: ErrorResponse = {
      error: 'ValidationError',
      message: 'Request validation failed',
      code: 'VALIDATION_ERROR',
      details: {
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      },
      timestamp: new Date().toISOString(),
      requestId
    }

    return NextResponse.json(response, { status: 400 })
  }

  // Handle database errors
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as any
    
    // PostgreSQL specific errors
    switch (dbError.code) {
      case '23505': // unique_violation
        return NextResponse.json({
          error: 'ConflictError',
          message: 'Resource already exists',
          code: 'DUPLICATE_RESOURCE',
          timestamp: new Date().toISOString(),
          requestId
        }, { status: 409 })
        
      case '23503': // foreign_key_violation
        return NextResponse.json({
          error: 'ValidationError',
          message: 'Referenced resource does not exist',
          code: 'FOREIGN_KEY_VIOLATION',
          timestamp: new Date().toISOString(),
          requestId
        }, { status: 400 })
        
      case '23502': // not_null_violation
        return NextResponse.json({
          error: 'ValidationError',
          message: 'Required field is missing',
          code: 'MISSING_REQUIRED_FIELD',
          timestamp: new Date().toISOString(),
          requestId
        }, { status: 400 })
    }
  }

  // Handle JavaScript errors
  if (error instanceof Error) {
    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    const response: ErrorResponse = {
      error: 'InternalServerError',
      message: isDevelopment ? error.message : 'An internal server error occurred',
      code: 'INTERNAL_SERVER_ERROR',
      details: isDevelopment ? { stack: error.stack } : undefined,
      timestamp: new Date().toISOString(),
      requestId
    }

    return NextResponse.json(response, { status: 500 })
  }

  // Handle unknown errors
  const response: ErrorResponse = {
    error: 'UnknownError',
    message: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString(),
    requestId
  }

  return NextResponse.json(response, { status: 500 })
}

// Async error wrapper for API routes
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await fn(...args)
    } catch (error) {
      return handleError(error)
    }
  }
}

// Wrapper for API route handlers
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  options?: { requestId?: string }
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleError(error, options?.requestId)
    }
  }
}

// Logger interface for structured error logging
export interface ErrorLogger {
  error: (message: string, error: Error, context?: any) => void
  warn: (message: string, context?: any) => void
  info: (message: string, context?: any) => void
}

// Simple console logger implementation
export const consoleLogger: ErrorLogger = {
  error: (message: string, error: Error, context?: any) => {
    console.error(`[ERROR] ${message}`, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      timestamp: new Date().toISOString()
    })
  },
  warn: (message: string, context?: any) => {
    console.warn(`[WARN] ${message}`, context)
  },
  info: (message: string, context?: any) => {
    console.info(`[INFO] ${message}`, context)
  }
}

// Error reporting function
export function reportError(
  error: Error,
  context: {
    userId?: string
    requestId?: string
    endpoint?: string
    userAgent?: string
    ip?: string
  },
  logger: ErrorLogger = consoleLogger
) {
  logger.error(
    `API Error in ${context.endpoint || 'unknown endpoint'}`,
    error,
    context
  )
  
  // Here you could integrate with error tracking services like:
  // - Sentry
  // - Rollbar
  // - Bugsnag
  // - Custom logging service
}







