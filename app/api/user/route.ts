import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'
import { authService } from '@/lib/auth/auth-service'
import { AuthenticationError, AuthorizationError } from '@/lib/error-handler'

// Helper function to verify authentication
async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Authentication required')
  }

  const token = authHeader.replace('Bearer ', '')
  return await authService.verifyToken(token)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
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
    
    // Only superadmin can create user accounts directly
    if (user.role !== 'super_admin') {
      throw new AuthorizationError('Only superadmin can create user accounts directly')
    }

    const body = await request.json()
    const { id, email, firstName, lastName, phoneNumber, countryCode, avatar, role = 'user' } = body

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
    const body = await request.json()
    const { userId, updates } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const user = await dbService.updateUser(userId, updates)

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
}