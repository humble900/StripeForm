import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db/service'
import { withRateLimit, apiRateLimit } from '@/lib/rate-limit'
import { withErrorHandling, AuthenticationError } from '@/lib/error-handler'

// Helper function to get user from request
async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Authentication required')
  }
  
  const token = authHeader.replace('Bearer ', '')
  
  // For now, use the token as the user ID (this should be improved with proper JWT validation)
  return { id: token, email: 'user@example.com' }
}

// POST /api/user/forms/[id]/clone - Clone a form
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(request, apiRateLimit,
    withErrorHandling(async (request: NextRequest) => {
      try {
        const user = await getUserFromRequest(request)
        const { id } = await params
        
        // Verify the form exists and belongs to the user
        const originalForm = await dbService.getForm(id)
        if (!originalForm || originalForm.userId !== user.id) {
          return NextResponse.json({
            success: false,
            message: 'Form not found or access denied'
          }, { status: 404 })
        }
        
        // Create a cloned form
        const timestamp = Date.now().toString(36)
        const clonedForm = await dbService.createForm({
          title: `${originalForm.title} (Copy)`,
          description: originalForm.description || '',
          slug: `${originalForm.slug}-copy-${timestamp}`,
          userId: user.id,
          status: 'draft',
          isPublic: false,
          allowAnonymous: originalForm.allowAnonymous,
          requireCaptcha: originalForm.requireCaptcha,
          maxSubmissions: originalForm.maxSubmissions,
          submissionLimit: originalForm.submissionLimit,
          settings: originalForm.settings || {}
        })

        // Clone form fields if they exist
        const originalFields = await dbService.getFormFields(id)
        if (originalFields && originalFields.length > 0) {
          const fieldPromises = originalFields.map((field, index) => 
            dbService.createFormField({
              formId: clonedForm.id,
              type: field.type,
              label: field.label,
              placeholder: field.placeholder || null,
              required: field.required,
              validation: field.validation || null,
              options: field.options || null,
              order: index,
              settings: field.settings || null,
              conditionalLogic: field.conditionalLogic || null
            })
          )
          
          await Promise.all(fieldPromises)
        }
        
        // Invalidate cache
        const { formCache } = await import('@/lib/cache')
        formCache.delete(`form:${id}`)
        
        // Invalidate user forms cache for this user
        const userFormsCacheKeys = [
          `user-forms:${user.id}:all:50:0`,
          `user-forms:${user.id}:published:50:0`,
          `user-forms:${user.id}:draft:50:0`
        ]
        
        userFormsCacheKeys.forEach(key => {
          formCache.delete(key)
        })
        
        return NextResponse.json({
          success: true,
          data: clonedForm,
          message: 'Form cloned successfully'
        })
        
      } catch (error) {
        if (error instanceof AuthenticationError) {
          return NextResponse.json({
            success: false,
            message: error.message
          }, { status: error.statusCode })
        }
        
        console.error('Clone form error:', error)
        return NextResponse.json({
          success: false,
          message: 'Internal server error'
        }, { status: 500 })
      }
    })
  )
}
