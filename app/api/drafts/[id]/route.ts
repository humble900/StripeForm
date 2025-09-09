import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'
import { z } from 'zod'

// Validation schemas
const updateDraftSchema = z.object({
  draftData: z.record(z.any()).optional(),
  progressData: z.record(z.any()).optional(),
})

// Helper function to extract user identification from request
function getUserIdentification(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const sessionId = request.headers.get('x-session-id')
  const fingerprint = request.headers.get('x-fingerprint')
  
  let userId: string | undefined
  if (authHeader && authHeader.startsWith('Bearer ')) {
    userId = authHeader.replace('Bearer ', '')
  }
  
  return { userId, sessionId, fingerprint }
}

// GET /api/drafts/[id] - Get specific draft
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const draft = await dbService.getDraft(id)
    
    if (!draft) {
      return NextResponse.json(
        { success: false, error: 'Draft not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: draft
    })
  } catch (error) {
    console.error('Error fetching draft:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch draft' },
      { status: 500 }
    )
  }
}

// PUT /api/drafts/[id] - Update specific draft
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const validatedData = updateDraftSchema.parse(body)
    
    const { id } = await params
    const draft = await dbService.updateDraft(id, validatedData)
    
    if (!draft) {
      return NextResponse.json(
        { success: false, error: 'Draft not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: draft
    })
  } catch (error) {
    console.error('Error updating draft:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update draft' },
      { status: 500 }
    )
  }
}

// DELETE /api/drafts/[id] - Delete specific draft
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await dbService.deleteDraft(id)
    
    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting draft:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete draft' },
      { status: 500 }
    )
  }
}
