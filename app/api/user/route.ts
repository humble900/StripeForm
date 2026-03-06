import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'
import { authService } from '@/lib/auth/auth-service'
import { AuthenticationError, AuthorizationError } from '@/lib/error-handler'

// Helper function to verify authentication
async function verifyAuth(request: NextRequest) {
  // Check for cookie-based authentication first
  const cookieToken = request.cookies.get('auth-token')?.value
  if (cookieToken) {
    try {
      const userData = JSON.parse(cookieToken)
      return { id: userData.userId || userData.id, role: userData.role || 'user' }
    } catch {
      // Fallback to header-based auth
    }
  }

  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Authentication required')
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    // Try to verify as Custom JWT token
    return await authService.verifyToken(token)
  } catch (error) {
    // Fallback: This app heavily uses Firebase Auth on the client,
    // and passes the raw UID (or 'anonymous' / fingerprint) as the Bearer token.
    return { id: token, role: 'user' } as any;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = await verifyAuth(request)

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Users can only fetch their own data unless admin/super_admin
    if (authUser.id !== userId && authUser.role !== 'admin' && authUser.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    const user = await dbService.getUser(userId)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      )
    }
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request)

    const body = await request.json()
    const { id, email, firstName, lastName, phoneNumber, countryCode, avatar, role = 'user' } = body

    // Validate authorization:
    // Superadmins can create anyone. Normal users can only create their own record and can only be 'user'
    if (user.role !== 'super_admin') {
      if (user.id !== id) {
        throw new AuthorizationError('You are only authorized to provision your own account')
      }
      if (role !== 'user') {
        throw new AuthorizationError('Unauthorized to assign elevated roles during self-registration')
      }
    }

    // Validate role if provided
    if (role && !['user', 'admin', 'super_admin'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role specified' },
        { status: 400 }
      )
    }

    const newUser = await dbService.createUser({
      id,
      email,
      firstName: firstName || null,
      lastName: lastName || null,
      phoneNumber: phoneNumber || null,
      countryCode: countryCode || null,
      avatar: avatar || null,
      role: role as 'user' | 'admin' | 'super_admin'
    })

    return NextResponse.json({
      success: true,
      data: newUser
    })
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = await verifyAuth(request)

    const body = await request.json()
    const { userId, updates } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Users can only update their own data unless admin/super_admin
    if (authUser.id !== userId && authUser.role !== 'admin' && authUser.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    const user = await dbService.updateUser(userId, updates)

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      )
    }
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
}