import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fingerprint = searchParams.get('fingerprint')
    
    if (!fingerprint) {
      return NextResponse.json(
        { success: false, error: 'Fingerprint is required' },
        { status: 400 }
      )
    }

    const anonymousUser = await dbService.getAnonymousUser(fingerprint)
    
    return NextResponse.json({
      success: true,
      data: anonymousUser
    })
  } catch (error) {
    console.error('Error fetching anonymous user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch anonymous user' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fingerprint, ipAddress, userAgent, country, city, timezone, metadata } = body

    const anonymousUser = await dbService.createAnonymousUser({
      fingerprint,
      sessionData: {
        country: country || null,
        city: city || null,
        timezone: timezone || null,
        metadata: metadata || {}
      },
      ipAddress: ipAddress || null,
      userAgent: userAgent || null
    })

    return NextResponse.json({
      success: true,
      data: anonymousUser
    })
  } catch (error) {
    console.error('Error creating anonymous user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create anonymous user' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { fingerprint, updates } = body

    if (!fingerprint) {
      return NextResponse.json(
        { success: false, error: 'Fingerprint is required' },
        { status: 400 }
      )
    }

    console.log('Updating anonymous user:', { fingerprint, updates })
    
    const anonymousUser = await dbService.updateAnonymousUser(fingerprint, updates)

    return NextResponse.json({
      success: true,
      data: anonymousUser
    })
  } catch (error) {
    console.error('Error updating anonymous user:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { success: false, error: 'Failed to update anonymous user' },
      { status: 500 }
    )
  }
}

