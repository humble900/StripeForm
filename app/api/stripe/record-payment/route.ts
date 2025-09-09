import { NextRequest, NextResponse } from 'next/server'
import { dbService as db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentIntentId, amount, currency, status, metadata } = body || {}

    if (!paymentIntentId || !amount || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Record payment in database
    const paymentRecord = await db.createPaymentIntent({
      stripePaymentIntentId: paymentIntentId,
      amount,
      currency: currency || 'usd',
      status,
      metadata: metadata || {},
      userId: metadata?.user_id || null
    })

    return NextResponse.json({
      success: true,
      payment_id: paymentRecord.id
    })

  } catch (err: any) {
    console.error('record-payment error:', err)
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}



