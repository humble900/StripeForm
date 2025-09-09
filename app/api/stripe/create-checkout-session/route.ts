import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { env } from '@/lib/env'

function getOrigin(request: NextRequest): string {
  const proto = request.headers.get('x-forwarded-proto')
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  if (proto && host) return `${proto}://${host}`
  try {
    return new URL(request.url).origin
  } catch {
    return env.app.url || 'http://localhost:3000'
  }
}

async function resolvePriceId(stripe: Stripe, idOrProduct: string): Promise<string> {
  // Accept either a price_... or prod_... value. If prod_, fetch default_price
  if (idOrProduct.startsWith('price_')) return idOrProduct
  if (idOrProduct.startsWith('prod_')) {
    const product = await stripe.products.retrieve(idOrProduct)
    const defaultPrice = product.default_price
    if (!defaultPrice) throw new Error('Product has no default price configured')
    if (typeof defaultPrice === 'string') return defaultPrice
    return defaultPrice.id
  }
  // Unknown pattern, let Stripe handle error later
  return idOrProduct
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({} as any))
    const plan = body?.plan as 'pro_monthly' | 'pro_yearly' | undefined
    const incomingId = (body?.priceId as string | undefined)?.trim()
    const successUrl = body?.successUrl as string | undefined
    const cancelUrl = body?.cancelUrl as string | undefined

    const secretKey = env.stripe.secretKey || process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const stripe = new Stripe(secretKey, { apiVersion: '2025-08-27.basil' })

    const fallbackMonthly = env.stripe.proMonthlyPriceId
    const fallbackYearly = env.stripe.proYearlyPriceId

    let idToUse = incomingId || (plan === 'pro_yearly' ? fallbackYearly : fallbackMonthly)
    if (!idToUse) {
      return NextResponse.json(
        { error: 'Stripe price/product ID not configured. Provide priceId or set STRIPE_PRO_MONTHLY_PRICE_ID / NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID.' },
        { status: 400 }
      )
    }

    // Resolve prod_ to price_
    const resolvedPriceId = await resolvePriceId(stripe, idToUse)

    const origin = getOrigin(request)

    const userId = request.cookies.get('auth-token')?.value || undefined

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: resolvedPriceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: successUrl || `${origin}/dashboard?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}/pricing?upgrade=cancelled`,
      metadata: userId ? { userId } : undefined,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('create-checkout-session error:', err)
    const message = err?.raw?.message || err?.message || 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

