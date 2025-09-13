import { NextRequest, NextResponse } from 'next/server'
import { dbService as db } from '@/lib/db'
import { withRateLimit, apiRateLimit } from '@/lib/rate-limit'
import { withErrorHandling } from '@/lib/error-handler'

// POST /api/forms/[id]/view - Track form view
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        const { id } = await params
        
        const isValidUuid = (uuid: string) => {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          return uuidRegex.test(uuid)
        }
        
        let form = null
        if (isValidUuid(id)) {
          form = await db.getForm(id)
        } else {
          form = await db.getFormBySlug(id)
        }

        if (!form) {
          return NextResponse.json({
            success: false,
            message: 'Form not found'
          }, { status: 404 })
        }
        
        if (form.status !== 'published') {
          return NextResponse.json({
            success: false,
            message: 'Form not published'
          }, { status: 403 })
        }
        
        // Increment view count using the form's actual ID (not slug)
        await db.updateForm(form.id, {
          viewCount: (form.viewCount || 0) + 1
        })
        
        return NextResponse.json({
          success: true,
          message: 'View tracked',
          viewCount: (form.viewCount || 0) + 1
        })
        
      } catch (error) {
        console.error('Track view error:', error)
        return NextResponse.json({
          success: false,
          message: 'Internal server error'
        }, { status: 500 })
      }
    })
  )
}
