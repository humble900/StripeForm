import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'

// POST /api/admin/cleanup-drafts - Clean up expired drafts
export async function POST(request: NextRequest) {
  try {
    // This endpoint should be protected with admin authentication
    // For now, we'll add basic protection
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const cleanedCount = await dbService.cleanupExpiredDrafts()
    
    return NextResponse.json({
      success: true,
      message: `Cleaned up ${cleanedCount} expired drafts`,
      data: { cleanedCount }
    })
  } catch (error) {
    console.error('Error cleaning up drafts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clean up drafts' },
      { status: 500 }
    )
  }
}
