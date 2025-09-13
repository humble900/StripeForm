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

    // Create the form using the database service
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
      brandKit: template.templateData.brandKit || {}
    })

    console.log('✅ Form created:', formData.id)

    // Create form fields using the database service
    const createdFields = []
    for (let index = 0; index < template.templateData.fields.length; index++) {
      const field = template.templateData.fields[index]
      try {
        const createdField = await dbService.createFormField({
          formId: formData.id,
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
        })
        createdFields.push(createdField)
        console.log(`✅ Field ${index + 1} created:`, field.label)
      } catch (fieldError) {
        console.error('❌ Error creating form field:', fieldError)
        // Clean up the form if fields creation failed
        await dbService.deleteForm(formData.id)
        return NextResponse.json(
          { success: false, error: 'Failed to create form fields' },
          { status: 500 }
        )
      }
    }

    console.log(`✅ All ${createdFields.length} fields created successfully`)

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
