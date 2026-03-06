import { NextRequest, NextResponse } from 'next/server'
import { getTemplateById } from '@/lib/templates'
import { dbService } from '@/lib/db/service'
import { v4 as uuidv4 } from 'uuid'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: string | undefined
  let userId: string | undefined

  try {
    const requestBody = await request.json()
    userId = requestBody.userId
    const resolvedParams = await params
    id = resolvedParams.id

    console.log('📋 Template copy request:', { templateId: id, userId })

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const template = getTemplateById(id)

    if (!template) {
      console.error('❌ Template not found:', id)
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    console.log('✅ Template found:', template.name)

    // Generate a unique slug (consistent with forms API)
    const baseSlug = template.templateData.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)

    const timestamp = Date.now().toString(36)
    const slug = `${baseSlug}-${timestamp}`

    console.log('📝 Creating form with slug:', slug)

    // Prepare fields for batch creation
    const fieldsToCreate = template.templateData.fields.map((field, index) => ({
      type: field.type,
      label: field.label,
      placeholder: field.placeholder || null,
      required: field.required || false,
      validation: field.validation || null,
      options: field.options || null,
      order: index,
      settings: field.settings || {},
      // Preserve conditional logic from template fields
      conditionalLogic: (field as any).conditional || (field as any).conditional_logic || (field as any).conditionalLogic || null
    }))

    // Create the form with fields in a single transaction
    const formData = await dbService.createForm({
      title: `${template.templateData.title} (Copy)`,
      description: template.templateData.description,
      slug: slug,
      userId: userId,
      status: 'draft',
      isPublic: false,
      allowAnonymous: true,
      requireCaptcha: false,
      settings: template.templateData.settings,
      theme: template.templateData.theme,
      brandKit: template.templateData.brandKit || {},
      fields: fieldsToCreate // Pass fields for batch creation
    })

    console.log('✅ Form and fields created in single transaction:', formData.id)
    const createdFields = (formData as any).fields || []

    // Create a draft for the copied form
    try {
      const draftData = {
        formId: formData.id,
        userId: userId,
        draftData: {
          title: formData.title,
          description: formData.description,
          fields: createdFields.map((field: any) => ({
            id: field.id,
            type: field.type,
            label: field.label,
            placeholder: field.placeholder,
            required: field.required,
            validation: field.validation,
            options: field.options,
            order: field.order,
            settings: field.settings,
            conditionalLogic: field.conditionalLogic
          })),
          settings: formData.settings,
          theme: formData.theme,
          brandKit: formData.brandKit
        },
        progressData: {
          currentStep: 0,
          completedSteps: ['template_selected']
        }
      }

      await dbService.createDraft(draftData)
      console.log('✅ Draft created for template copy')
    } catch (draftError) {
      console.warn('⚠️ Failed to create draft for template copy:', draftError)
      // Don't fail the entire operation if draft creation fails
    }

    // Invalidate user forms cache for this user
    const { formCache } = await import('@/lib/cache')
    const userFormsCacheKeys = [
      `user-forms:${userId}:all:50:0`,
      `user-forms:${userId}:published:50:0`,
      `user-forms:${userId}:draft:50:0`
    ]

    userFormsCacheKeys.forEach(key => {
      formCache.delete(key)
    })

    const response = {
      success: true,
      data: {
        formId: formData.id,
        form: formData,
        fields: createdFields,
        message: 'Template copied successfully'
      }
    }

    console.log('🎉 Template copy completed:', response.data.formId)
    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ Error copying template:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      templateId: id || 'unknown',
      userId: userId || 'unknown'
    })
    return NextResponse.json(
      { success: false, error: 'Failed to copy template' },
      { status: 500 }
    )
  }
}
