import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'

// GET /api/forms/[id]/drafts - Get all drafts for a specific form
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const drafts = await dbService.getFormDrafts(id)
    
    return NextResponse.json({
      success: true,
      data: drafts
    })
  } catch (error) {
    console.error('Error fetching form drafts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch form drafts' },
      { status: 500 }
    )
  }
}
