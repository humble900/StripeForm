import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formId, data } = body

    if (!formId) {
      return NextResponse.json({
        success: false,
        error: 'formId is required'
      }, { status: 400 })
    }

    // Create the response
    const response = await dbService.createResponse({
      formId,
      userId: null,
      sessionId: null,
      ipAddress: null,
      userAgent: null,
      referrer: null,
      status: 'pending',
      isSpam: false,
      spamScore: null,
      data: data || {},
      metadata: {}
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

