import { NextRequest, NextResponse } from 'next/server'
import { dbService as db } from '@/lib/db'

// GET /api/analytics - Get analytics data for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d, 1y

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      )
    }

    // Get user's forms
    const forms = await db.getUserForms(userId)
    
    // Get form submissions for analytics
    const submissions = await db.getUserFormSubmissions(userId)
    
    // Calculate analytics
    const analytics = {
      totalForms: forms.length,
      totalSubmissions: submissions.length,
      publishedForms: forms.filter(f => f.status === 'published').length,
      draftForms: forms.filter(f => f.status === 'draft').length,
      archivedForms: forms.filter(f => f.status === 'archived').length,
      averageSubmissionsPerForm: forms.length > 0 ? (submissions.length / forms.length).toFixed(2) : 0,
      topPerformingForms: forms
        .map(form => ({
          id: form.id,
          title: form.title,
          submissionCount: submissions.filter(s => s.formId === form.id).length
        }))
        .sort((a, b) => b.submissionCount - a.submissionCount)
        .slice(0, 5)
    }

    return NextResponse.json({
      success: true,
      analytics,
      period
    })

  } catch (err: any) {
    console.error('Get analytics error:', err)
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}



