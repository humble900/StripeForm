import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'

export async function GET() {
  try {
    const faqs = await dbService.getActiveFAQs()
    return NextResponse.json(faqs)
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    
    // Return mock FAQ data as fallback
    const mockFAQs = [
      {
        id: '1',
        question: 'What is StripeForm?',
        answer: 'StripeForm is a powerful form builder that allows you to create beautiful, interactive forms with built-in payment processing through Stripe.',
        category: 'general',
        order: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        question: 'How do I accept payments in my forms?',
        answer: 'You can add payment fields to your forms and integrate with Stripe to accept payments. Simply add a payment field and configure your Stripe settings.',
        category: 'payments',
        order: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        question: 'Can I customize the appearance of my forms?',
        answer: 'Yes! StripeForm offers extensive customization options including themes, colors, fonts, and layout options to match your brand.',
        category: 'customization',
        order: 3,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    return NextResponse.json(mockFAQs)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, answer, category, order, createdBy } = body

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      )
    }

    const newFAQ = await dbService.createFAQ({
      question,
      answer,
      category: category || 'general',
      order: order || 0,
      createdBy,
    })

    return NextResponse.json(newFAQ, { status: 201 })
  } catch (error) {
    console.error('Error creating FAQ:', error)
    return NextResponse.json(
      { error: 'Failed to create FAQ' },
      { status: 500 }
    )
  }
}
