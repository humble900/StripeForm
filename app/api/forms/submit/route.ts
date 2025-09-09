import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formId, userId, sessionId, ipAddress, userAgent, referrer, status, isSpam, spamScore, data, metadata } = body

    // Create the response
    const response = await dbService.createResponse({
      formId,
      userId: userId || null,
      sessionId: sessionId || null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      referrer: referrer || null,
      status: status || 'pending',
      isSpam: isSpam || false,
      spamScore: spamScore || null,
      data,
      metadata: metadata || {}
    })

    return NextResponse.json({
      success: true,
      data: response
    })
  } catch (error) {
    console.error('Error creating form response:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create form response' },
      { status: 500 }
    )
  }
}