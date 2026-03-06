import { NextRequest, NextResponse } from 'next/server'
import { dbService as db } from '@/lib/db'
import { withRateLimit, apiRateLimit } from '@/lib/rate-limit'
import { withErrorHandling } from '@/lib/error-handler'

// POST /api/forms/[id]/view - Track form view
// Simple in-memory de-duplication cache by formId + fingerprint for 24h
const recentViews = new Map<string, number>()
const VIEW_TTL_MS = 24 * 60 * 60 * 1000

function makeViewKey(formId: string, fp: string) {
  return `${formId}::${fp}`
}

function cleanupOldViews() {
  const now = Date.now()
  for (const [k, ts] of recentViews.entries()) {
    if (now - ts > VIEW_TTL_MS) recentViews.delete(k)
  }
}

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
        
        // Determine viewer fingerprint (cookie/header) with fallback
        const fingerprint = request.cookies.get('sf_fp')?.value
          || request.headers.get('x-fingerprint')
          || ''
        const ua = request.headers.get('user-agent') || ''
        const fpfallback = fingerprint || `ip:${request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''}|ua:${ua}`

        // Deduplicate by form + fingerprint for 24h (persisted in anonymous user record if available)
        cleanupOldViews()
        const key = makeViewKey(form.id, fpfallback)
        const lastTs = recentViews.get(key)
        const now = Date.now()
        let incremented = false

        // Try persistent tracking using anonymous_users.session_data.viewedForms
        try {
          if (fingerprint) {
            const anon = await db.getAnonymousUser(String(fingerprint))
            const viewed = (anon?.sessionData as any)?.viewedForms || {}
            const last = viewed[form.id]
            if (!last || (now - new Date(last).getTime()) > VIEW_TTL_MS) {
              await db.updateAnonymousUser(String(fingerprint), {
                // Merge key -> timestamp
                viewedForms: { [form.id]: new Date().toISOString() }
              })
              await db.updateForm(form.id, { viewCount: (form.viewCount || 0) + 1 })
              incremented = true
            }
          }
        } catch {}

        // Fallback to in-memory de-dup if no fingerprint or DB path failed
        if (!incremented && (!lastTs || (now - lastTs) > VIEW_TTL_MS)) {
          await db.updateForm(form.id, { viewCount: (form.viewCount || 0) + 1 })
          recentViews.set(key, now)
          incremented = true
        }
        
        return NextResponse.json({
          success: true,
          message: 'View tracked',
          // Hint: client should re-fetch form to get authoritative count
          viewCount: (form.viewCount || 0) + (incremented ? 1 : 0)
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
