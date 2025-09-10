import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/auth/auth-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'No token provided'
      }, { status: 400 })
    }
    
    try {
      const user = await authService.verifyToken(token)
      return NextResponse.json({
        success: true,
        user: user,
        message: 'Token is valid'
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Token verification failed',
        message: 'Token is invalid or expired'
      }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
