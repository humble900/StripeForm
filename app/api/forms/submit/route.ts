import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'
import { withRateLimit, formSubmissionRateLimit } from '@/lib/rate-limit'
import { withErrorHandling } from '@/lib/error-handler'

export async function POST(request: NextRequest) {
  return withRateLimit(request, formSubmissionRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      const body = await request.json()
      const { id, formId, userId, sessionId, ipAddress, userAgent, referrer, status, isSpam, spamScore, data, metadata } = body

      if (!formId) {
        return NextResponse.json({ success: false, error: 'formId is required' }, { status: 400 })
      }

      // Derive client context (anonymous-friendly)
      const forwarded = request.headers.get('x-forwarded-for') || ''
      const realIp = request.headers.get('x-real-ip') || ''
      const derivedIp = (forwarded.split(',')[0] || realIp || ipAddress || 'Unknown').trim()
      const derivedUA = request.headers.get('user-agent') || userAgent || 'Unknown'
      const derivedRef = request.headers.get('referer') || referrer || ''
      const fingerprint = request.cookies.get('sf_fp')?.value || request.headers.get('x-fingerprint') || null

      // Ensure form is published before accepting submissions
      const form = await dbService.getForm(formId)
      if (!form) {
        return NextResponse.json({ success: false, error: 'Form not found' }, { status: 404 })
      }
      if (form.status !== 'published') {
        return NextResponse.json({ success: false, error: 'Form is not published' }, { status: 403 })
      }

      // Create or update the response
      const payload: any = {
        formId,
        userId: userId || null,
        sessionId: sessionId || (fingerprint ? `fp:${fingerprint}` : null),
        ipAddress: derivedIp,
        userAgent: derivedUA,
        referrer: derivedRef || null,
        status: status || 'pending',
        isSpam: isSpam || false,
        spamScore: spamScore || null,
        data: data || {},
        metadata: { ...(metadata || {}), fingerprint: fingerprint || undefined }
      }

      // If it's a final submission, ensure submittedAt is timestamped
      if (status !== 'partial') {
        payload.submittedAt = new Date()
      }

      let response;
      if (id) {
        // Drop fields that shouldn't change
        delete payload.formId;
        delete payload.submittedAt; // Will be set explicitly if not partial
        if (status !== 'partial') {
          payload.submittedAt = new Date();
        }
        response = await dbService.updateFormSubmission(id, payload);
      } else {
        response = await dbService.createFormSubmission(payload)
      }

      return NextResponse.json({ success: true, data: response })
    })
  )
}