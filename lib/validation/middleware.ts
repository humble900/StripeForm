import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export interface ValidationError {
  field: string
  message: string
  code: string
}

export function createValidationResponse(errors: ValidationError[]) {
  return NextResponse.json({
    error: 'Validation failed',
    message: 'One or more fields are invalid',
    details: {
      errors,
      count: errors.length
    },
    timestamp: new Date().toISOString()
  }, { status: 400 })
}

export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<{ data: T } | NextResponse> => {
    try {
      let body: any = {}
      
      // Handle different request methods
      if (request.method === 'GET' || request.method === 'DELETE') {
        // Parse query parameters
        const url = new URL(request.url)
        body = Object.fromEntries(url.searchParams.entries())
      } else {
        // Parse JSON body for POST, PUT, PATCH
        const text = await request.text()
        if (text) {
          try {
            body = JSON.parse(text)
          } catch (parseError) {
            return NextResponse.json({
              error: 'Invalid JSON',
              message: 'Request body must be valid JSON',
              timestamp: new Date().toISOString()
            }, { status: 400 })
          }
        }
      }

      // Validate against schema
      const result = schema.safeParse(body)
      
      if (!result.success) {
        const errors: ValidationError[] = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
        
        return createValidationResponse(errors)
      }

      return { data: result.data }
    } catch (error) {
      console.error('Validation middleware error:', error)
      return NextResponse.json({
        error: 'Validation error',
        message: 'An error occurred during validation',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }
  }
}

export async function withValidation<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>,
  handler: (data: T) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const validator = validateRequest(schema)
    const result = await validator(request)
    
    if (result instanceof NextResponse) {
      return result // Validation failed
    }
    
    return await handler(result.data)
  } catch (error) {
    console.error('Request handler error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Helper for validating search params specifically
export function validateSearchParams<T>(schema: z.ZodSchema<T>, searchParams: URLSearchParams): { data: T } | NextResponse {
  const params = Object.fromEntries(searchParams.entries())
  const result = schema.safeParse(params)
  
  if (!result.success) {
    const errors: ValidationError[] = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }))
    
    return createValidationResponse(errors)
  }
  
  return { data: result.data }
}

// Helper for validating JSON body
export async function validateJsonBody<T>(schema: z.ZodSchema<T>, request: NextRequest): Promise<{ data: T } | NextResponse> {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)
    
    if (!result.success) {
      const errors: ValidationError[] = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }))
      
      return createValidationResponse(errors)
    }
    
    return { data: result.data }
  } catch (parseError) {
    return NextResponse.json({
      error: 'Invalid JSON',
      message: 'Request body must be valid JSON',
      timestamp: new Date().toISOString()
    }, { status: 400 })
  }
}







