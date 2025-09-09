import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'

export async function GET() {
  try {
    const faqs = await dbService.getFAQs()
    return NextResponse.json(faqs)
  } catch (error) {
    console.error('Error fetching FAQs for admin:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    )
  }
}
