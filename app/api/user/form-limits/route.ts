import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const fingerprint = searchParams.get('fingerprint')
    
    if (!userId && !fingerprint) {
      return NextResponse.json(
        { success: false, error: 'User ID or fingerprint is required' },
        { status: 400 }
      )
    }

    let canCreateForm = true // Default to true to avoid blocking users
    let formCount = 0

    try {
      if (userId) {
        const formLimitData = await dbService.canUserCreateForm(userId)
        canCreateForm = formLimitData.canCreate
        formCount = formLimitData.currentCount
      } else if (fingerprint) {
        const formCountData = await dbService.getAnonymousUserFormCount(fingerprint)
        formCount = formCountData.currentCount
        canCreateForm = formCount < formCountData.limit // Anonymous users can publish max 5 forms
      }
    } catch (dbError) {
      console.error('Database error in form limits check:', dbError)
      // If database is unavailable, allow form creation to avoid blocking users
      canCreateForm = true
      formCount = 0
    }

    return NextResponse.json({
      success: true,
      data: {
        canCreateForm,
        formCount,
        isAnonymous: !userId
      }
    })
  } catch (error) {
    console.error('Error checking form limits:', error)
    // Return a safe default response instead of 500 error
    return NextResponse.json({
      success: true,
      data: {
        canCreateForm: true,
        formCount: 0,
        isAnonymous: !request.nextUrl.searchParams.get('userId')
      }
    })
  }
}

// POST method removed - form counting is now handled automatically by querying the forms table
// No manual increment needed since we count published forms directly from the database

